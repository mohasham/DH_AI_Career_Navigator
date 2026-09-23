"""
Roadmap step activity logging.

POST /progress/activity — logs a specific self-reported activity
(project, video, article, exercise) toward a roadmap step, then
recalculates that skill's score using a capped formula:

    final_score = max(real_assessment_score, min(sum(activity_points), 80))

The real, quiz-based assessment (Sprint 3) ALWAYS wins if it's
higher — self-reported activity can never exceed 80 on its own,
by design. This keeps assessed_level meaningfully more trustworthy
when backed by a real test, while still rewarding real, logged
effort with a genuine (if capped) contribution to the user's
skill profile and career match scores.
"""

from fastapi import APIRouter, Depends, HTTPException
from app.core.auth import get_current_user_id
from app.db.database import get_supabase
from app.schemas.activity import (
    ActivityLogRequest,
    ActivityOut,
    ActivityLogResponse,
    ACTIVITY_POINTS,
    MAX_PRACTICED_SCORE,
)

router = APIRouter()


@router.post("/progress/activity", response_model=ActivityLogResponse)
async def log_activity(
    request: ActivityLogRequest,
    user_id: str = Depends(get_current_user_id),
):
    supabase = get_supabase()

    # ------------------------------------------------------------
    # VALIDATE activity_type against the fixed, known list — never
    # trust an arbitrary string, and never let the client set its
    # own point value.
    # ------------------------------------------------------------
    if request.activity_type not in ACTIVITY_POINTS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid activity_type. Must be one of: {list(ACTIVITY_POINTS.keys())}",
        )

    points = ACTIVITY_POINTS[request.activity_type]

    # ------------------------------------------------------------
    # STEP 1 — Confirm this step exists AND belongs to the current
    # user's roadmap (same ownership check pattern as progress.py).
    # ------------------------------------------------------------
    step_result = (
        supabase.table("roadmap_steps")
        .select("id, skill_id, roadmaps(profile_id)")
        .eq("id", request.step_id)
        .single()
        .execute()
    )

    if not step_result.data:
        raise HTTPException(status_code=404, detail="Roadmap step not found.")

    step = step_result.data
    skill_id = step["skill_id"]
    owner_id = step["roadmaps"]["profile_id"]

    if owner_id != user_id:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to log activity on this roadmap step.",
        )

    if not skill_id:
        raise HTTPException(
            status_code=400,
            detail="This roadmap step has no associated skill to log activity against.",
        )

    # ------------------------------------------------------------
    # STEP 2 — Save the new activity.
    # ------------------------------------------------------------
    supabase.table("roadmap_step_activities").insert(
        {
            "step_id": request.step_id,
            "activity_type": request.activity_type,
            "description": request.description,
            "points": points,
        }
    ).execute()

    # ------------------------------------------------------------
    # STEP 3 — Recalculate this skill's capped "practiced" total
    # from ALL activities ever logged for this step.
    # ------------------------------------------------------------
    all_activities_result = (
        supabase.table("roadmap_step_activities")
        .select("id, activity_type, description, points")
        .eq("step_id", request.step_id)
        .execute()
    )
    all_activities = all_activities_result.data or []

    practiced_total_raw = sum(a["points"] for a in all_activities)
    practiced_points_total = min(practiced_total_raw, MAX_PRACTICED_SCORE)

    # ------------------------------------------------------------
    # STEP 4 — Compare against the REAL assessment score, and take
    # the higher. The real assessment always wins if it's higher —
    # this is the core safety guarantee of the whole feature.
    # ------------------------------------------------------------
    existing_skill = (
        supabase.table("user_skills")
        .select("assessed_level, source")
        .eq("profile_id", user_id)
        .eq("skill_id", skill_id)
        .execute()
    )

    real_assessment_score = 0
    if existing_skill.data and existing_skill.data[0]["source"] == "tested":
        real_assessment_score = existing_skill.data[0]["assessed_level"] or 0

    if real_assessment_score >= practiced_points_total:
        final_skill_score = real_assessment_score
        score_source = "tested"
    else:
        final_skill_score = practiced_points_total
        score_source = "practiced"

    # ------------------------------------------------------------
    # STEP 5 — Save the final score to user_skills. Only overwrite
    # source to "practiced" if practiced is what's actually
    # winning — never downgrade a real "tested" record if the
    # practiced total happens to be lower.
    # ------------------------------------------------------------
    supabase.table("user_skills").upsert(
        {
            "profile_id": user_id,
            "skill_id": skill_id,
            "assessed_level": final_skill_score,
            "source": score_source,
        },
        on_conflict="profile_id,skill_id",
    ).execute()

    skill_name_result = (
        supabase.table("skills").select("name").eq("id", skill_id).single().execute()
    )
    skill_name = skill_name_result.data["name"] if skill_name_result.data else None

    return ActivityLogResponse(
        step_id=request.step_id,
        skill_name=skill_name,
        activities=[
            ActivityOut(
                id=a["id"],
                activity_type=a["activity_type"],
                description=a["description"],
                points=a["points"],
            )
            for a in all_activities
        ],
        practiced_points_total=practiced_points_total,
        real_assessment_score=real_assessment_score,
        final_skill_score=final_skill_score,
        score_source=score_source,
    )