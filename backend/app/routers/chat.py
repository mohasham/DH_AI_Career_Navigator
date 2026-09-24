"""
AI Career Chat endpoints.

Lets a user have a real conversation with an AI assistant that's
grounded in their actual data — tested skills, career matches,
roadmap progress — rather than generic advice. Supports multiple
separate chat sessions per user (like a real chat app's history),
using the existing chat_sessions/chat_messages tables.

PROMPT ENGINEERING NOTES:
- Same principles as the roadmap generation prompt (Sprint 5): clear
  role assignment, explicit numbered rules, grounding data embedded
  directly in the system prompt, and the key anti-hallucination
  constraint repeated at the end for reinforcement.
- The AI is explicitly told to say "I don't know" rather than guess
  when asked about data not present in the user's real profile —
  this is the same defensive pattern used everywhere else in the
  app (roadmap generation, activity scoring) to keep AI output
  trustworthy and never fabricated.
"""

from fastapi import APIRouter, Depends, HTTPException
from groq import Groq
from app.core.auth import get_current_user_id
from app.core.config import settings
from app.db.database import get_supabase
from app.schemas.chat import (
    ChatSessionOut,
    ChatMessageOut,
    SendMessageRequest,
    SendMessageResponse,
)

router = APIRouter()


def build_context_summary(supabase, user_id: str) -> str:
    """
    Gathers the user's REAL data — skills, current roadmap — and
    formats it as grounding context for the AI. Same principle as
    roadmap generation: the AI explains and discusses, but never
    invents facts about the user's actual profile.
    """
    user_skills_result = (
        supabase.table("user_skills")
        .select("assessed_level, source, skills(name)")
        .eq("profile_id", user_id)
        .execute()
    )
    skills_lines = []
    for row in user_skills_result.data or []:
        skill_name = row["skills"]["name"] if row["skills"] else "Unknown"
        skills_lines.append(f"- {skill_name}: {row['assessed_level']}% ({row['source']})")
    skills_text = "\n".join(skills_lines) if skills_lines else "No skills assessed yet."

    roadmap_result = (
        supabase.table("roadmaps")
        .select("id, career_id, readiness_percentage, careers(title)")
        .eq("profile_id", user_id)
        .order("updated_at", desc=True)
        .limit(1)
        .execute()
    )
    roadmap_text = "No roadmap generated yet."
    if roadmap_result.data:
        r = roadmap_result.data[0]
        career_title = r["careers"]["title"] if r["careers"] else "a career"
        roadmap_text = f"Working toward: {career_title}, readiness: {r['readiness_percentage']}%"

    return f"""USER'S REAL DATA (use this to answer accurately — never invent skills, scores, or progress not listed here):

Assessed skills:
{skills_text}

Current roadmap:
{roadmap_text}
"""


def build_system_prompt(context: str) -> str:
    """
    Builds the system prompt for the chat assistant, following the
    same professional prompt-engineering pattern established in
    Sprint 5's roadmap generation: role assignment, embedded real
    data, numbered rules, and a repeated key constraint at the end.
    """
    return f"""You are the AI Career Coach for AI Career Navigator, a career-guidance platform.

ROLE:
Help the user understand their skills, career matches, skill gaps, and roadmap progress. Be encouraging, concise, and practical.

{context}

RULES YOU MUST FOLLOW:
1. Only reference skills, scores, and roadmap details that appear in the USER'S REAL DATA above. Never invent, assume, or guess a skill level, score, or achievement not explicitly listed.
2. If the user asks about something not covered in the data above (e.g. a skill they never tested, a career they haven't explored), say so honestly rather than guessing — suggest they take a real assessment or visit the relevant page.
3. Stay focused on career guidance, skills, and this platform's features. If asked something completely unrelated (e.g. general trivia, unrelated personal advice), politely redirect back to career topics.
4. Keep responses concise — 2-4 sentences for most answers, longer only if the user asks for detailed explanation.
5. Be encouraging and constructive, especially when discussing skill gaps — frame them as opportunities, not failures.
6. Never provide medical, legal, or financial advice, even if tangentially related to career choices.

Remember: only use the real data provided above. Do not invent any skill, score, or progress information."""


@router.post("/chat/sessions", response_model=ChatSessionOut)
async def create_session(user_id: str = Depends(get_current_user_id)):
    """
    Starts a new, empty chat session for the user.
    """
    supabase = get_supabase()
    result = (
        supabase.table("chat_sessions")
        .insert({"profile_id": user_id})
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to create chat session.")
    return ChatSessionOut(**result.data[0])


@router.get("/chat/sessions", response_model=list[ChatSessionOut])
async def list_sessions(user_id: str = Depends(get_current_user_id)):
    """
    Returns all of the user's past chat sessions, most recent first.
    """
    supabase = get_supabase()
    result = (
        supabase.table("chat_sessions")
        .select("id, profile_id, created_at")
        .eq("profile_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return [ChatSessionOut(**row) for row in (result.data or [])]


@router.get("/chat/sessions/{session_id}/messages", response_model=list[ChatMessageOut])
async def get_session_messages(session_id: int, user_id: str = Depends(get_current_user_id)):
    """
    Returns all messages in a specific session, oldest first —
    only if the session belongs to the current user.
    """
    supabase = get_supabase()

    session_check = (
        supabase.table("chat_sessions")
        .select("profile_id")
        .eq("id", session_id)
        .single()
        .execute()
    )
    if not session_check.data or session_check.data["profile_id"] != user_id:
        raise HTTPException(status_code=404, detail="Chat session not found.")

    messages_result = (
        supabase.table("chat_messages")
        .select("id, role, content, created_at")
        .eq("session_id", session_id)
        .order("created_at")
        .execute()
    )
    return [ChatMessageOut(**row) for row in (messages_result.data or [])]


@router.post("/chat/sessions/{session_id}/messages", response_model=SendMessageResponse)
async def send_message(
    session_id: int,
    request: SendMessageRequest,
    user_id: str = Depends(get_current_user_id),
):
    """
    Sends a user message in a session, gets a grounded AI response,
    saves both, and returns them.
    """
    supabase = get_supabase()

    # Verify ownership
    session_check = (
        supabase.table("chat_sessions")
        .select("profile_id")
        .eq("id", session_id)
        .single()
        .execute()
    )
    if not session_check.data or session_check.data["profile_id"] != user_id:
        raise HTTPException(status_code=404, detail="Chat session not found.")

    # Save the user's message
    user_msg_insert = (
        supabase.table("chat_messages")
        .insert({"session_id": session_id, "role": "user", "content": request.content})
        .execute()
    )
    if not user_msg_insert.data:
        raise HTTPException(status_code=400, detail="Failed to save message.")
    user_message = ChatMessageOut(**user_msg_insert.data[0])

    # Fetch recent conversation history for context (last 10 messages)
    history_result = (
        supabase.table("chat_messages")
        .select("role, content")
        .eq("session_id", session_id)
        .order("created_at", desc=True)
        .limit(10)
        .execute()
    )
    history = list(reversed(history_result.data or []))

    # Build grounding context from real user data, then the full
    # system prompt with numbered rules and repeated constraints.
    context = build_context_summary(supabase, user_id)
    system_prompt = build_system_prompt(context)

    groq_messages = [{"role": "system", "content": system_prompt}]
    for msg in history:
        role = "assistant" if msg["role"] == "assistant" else "user"
        groq_messages.append({"role": role, "content": msg["content"]})

    client = Groq(api_key=settings.groq_api_key)
    try:
        completion = client.chat.completions.create(
            model=settings.groq_model,
            messages=groq_messages,
            temperature=0.5,
        )
        ai_response_text = completion.choices[0].message.content
    except Exception:
        raise HTTPException(
            status_code=502,
            detail="Failed to get a response from the AI. Please try again.",
        )

    # Save the AI's response
    assistant_msg_insert = (
        supabase.table("chat_messages")
        .insert({"session_id": session_id, "role": "assistant", "content": ai_response_text})
        .execute()
    )
    assistant_message = ChatMessageOut(**assistant_msg_insert.data[0])

    return SendMessageResponse(
        user_message=user_message,
        assistant_message=assistant_message,
    )