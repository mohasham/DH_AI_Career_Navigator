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

from app.schemas.assessment import AssessmentSubmit, AssessmentResult
from datetime import datetime, timezone


# Difficulty weighting — harder questions count for more of the
# final score, so two users who both get "some questions right"
# aren't scored identically if one tackled harder material.
DIFFICULTY_WEIGHTS = {"easy": 1, "medium": 2, "hard": 3}


@router.post("/assessment/submit", response_model=AssessmentResult)
async def submit_assessment(
    submission: AssessmentSubmit,
    user_id: str = Depends(get_current_user_id),
):
    """
    Scores a user's assessment answers and saves the result.

    Scoring happens ENTIRELY server-side: we re-fetch the real
    correct_answer and difficulty for each question from the
    database and compare against what the user submitted — we
    never trust a "was this correct" flag sent from the frontend,
    since that could be trivially faked to claim a perfect score.
    """
    supabase = get_supabase()

    # Find the skill.
    skill_result = (
        supabase.table("skills")
        .select("id, name")
        .ilike("name", submission.skill_name)
        .single()
        .execute()
    )

    if not skill_result.data:
        raise HTTPException(
            status_code=404, detail=f"Skill '{submission.skill_name}' not found."
        )

    skill_id = skill_result.data["id"]
    skill_name = skill_result.data["name"]

    # Fetch the REAL questions with their correct answers — this
    # query is only ever run server-side, so the answer key never
    # reaches the browser at any point in this flow.
    questions_result = (
        supabase.table("questions")
        .select("id, correct_answer, difficulty")
        .eq("skill_id", skill_id)
        .execute()
    )

    if not questions_result.data:
        raise HTTPException(
            status_code=404, detail=f"No questions found for skill '{submission.skill_name}'."
        )

    # ------------------------------------------------------------
    # SCORING LOGIC
    # ------------------------------------------------------------
    total_weight = 0
    earned_weight = 0
    correct_count = 0

    # Will hold rows to insert into assessment_answers once we know
    # the assessment's own id (created further below).
    answer_records = []

    for question in questions_result.data:
        q_id = question["id"]
        weight = DIFFICULTY_WEIGHTS.get(question["difficulty"], 1)
        total_weight += weight

        user_answer = submission.answers.get(q_id)
        is_correct = user_answer is not None and user_answer == question["correct_answer"]

        if is_correct:
            earned_weight += weight
            correct_count += 1

        answer_records.append(
            {
                "question_id": q_id,
                "user_answer": user_answer,
                "is_correct": is_correct,
            }
        )

    # Score as a percentage, weighted by difficulty rather than a
    # flat "correct / total" count — e.g. getting the one hard
    # question right is worth more than one easy question.
    score = round((earned_weight / total_weight) * 100) if total_weight > 0 else 0

    # ------------------------------------------------------------
    # SAVE THE ASSESSMENT
    # ------------------------------------------------------------
    assessment_insert = (
        supabase.table("assessments")
        .insert(
            {
                "profile_id": user_id,
                "skill_id": skill_id,
                "score": score,
                "completed_at": datetime.now(timezone.utc).isoformat(),
            }
        )
        .execute()
    )

    if not assessment_insert.data:
        raise HTTPException(status_code=400, detail="Failed to save assessment.")

    assessment_id = assessment_insert.data[0]["id"]

    # Attach the assessment_id to each answer record now that we
    # have it, then save all individual answers in one batch insert.
    for record in answer_records:
        record["assessment_id"] = assessment_id

    supabase.table("assessment_answers").insert(answer_records).execute()

    # ------------------------------------------------------------
    # ALSO SAVE TO user_skills — this is what career matching
    # (Sprint 4) will actually read from, since it compares a
    # user's ASSESSED skill level against each career's required
    # level, not the raw assessment score directly.
    # ------------------------------------------------------------
    supabase.table("user_skills").upsert(
        {
            "profile_id": user_id,
            "skill_id": skill_id,
            "assessed_level": score,
            "source": "tested",
        },
        on_conflict="profile_id,skill_id",
    ).execute()

    return AssessmentResult(
        skill_name=skill_name,
        score=score,
        correct_count=correct_count,
        total_questions=len(questions_result.data),
    )