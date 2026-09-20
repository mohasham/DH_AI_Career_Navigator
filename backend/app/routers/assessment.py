"""
Skill assessment endpoints.

GET /assessment/questions/{skill} — fetches the question bank for
a given skill, with answers stripped out before sending to the
frontend (scoring happens server-side only, in a later endpoint).
"""

from fastapi import APIRouter, HTTPException, Depends
from app.core.auth import get_current_user_id
from app.db.database import get_supabase
from app.schemas.assessment import QuestionsListResponse, QuestionResponse

router = APIRouter()


@router.get("/assessment/questions/{skill}", response_model=QuestionsListResponse)
async def get_questions_for_skill(
    skill: str,
    user_id: str = Depends(get_current_user_id),
):
    """
    Returns all questions for the given skill name (e.g. "Python"),
    with the correct_answer field stripped out of each question
    before it's sent to the frontend.

    Requires a logged-in user (via get_current_user_id) even though
    the questions themselves aren't user-specific data — this keeps
    the assessment feature consistently behind auth, matching the
    rest of the app, rather than leaving question content publicly
    accessible to anyone without an account.
    """
    supabase = get_supabase()

    # First, find the skill's id from its name.
    skill_result = (
        supabase.table("skills")
        .select("id, name")
        .ilike("name", skill)
        .single()
        .execute()
    )

    if not skill_result.data:
        raise HTTPException(status_code=404, detail=f"Skill '{skill}' not found.")

    skill_id = skill_result.data["id"]
    skill_name = skill_result.data["name"]

    # Fetch all questions for that skill.
    questions_result = (
        supabase.table("questions")
        .select("id, question_text, options, difficulty")
        .eq("skill_id", skill_id)
        .execute()
    )

    if not questions_result.data:
        raise HTTPException(
            status_code=404,
            detail=f"No questions found for skill '{skill}'.",
        )

    # Note: correct_answer was never selected above, so there's
    # nothing to strip — this is a "secure by construction" query
    # rather than fetching everything and filtering afterward.
    questions = [
        QuestionResponse(
            id=q["id"],
            question_text=q["question_text"],
            options=q["options"],
            difficulty=q["difficulty"],
        )
        for q in questions_result.data
    ]

    return QuestionsListResponse(skill_name=skill_name, questions=questions)