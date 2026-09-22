"""
Progress tracking endpoints.

POST /progress/update — marks a single roadmap step as complete
or incomplete (self-reported by the user, no re-assessment
required — this was a deliberate scope decision to keep Sprint 6
focused, matching the MVP), then recalculates and saves the
roadmap's readiness percentage to reflect the new progress.

Readiness here blends two things:
1. The user's assessed skill levels (same deterministic math as
   Sprint 4/5) — this reflects what they can actually DO.
2. Completed roadmap steps — this reflects how far they've
   progressed through the RECOMMENDED plan.
Both matter: a user could be skilled but not have followed the
roadmap yet, or have completed steps without retesting their
assessed level. Blending both gives a fairer picture than either
alone.
"""

from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone
from app.core.auth import get_current_user_id
from app.db.database import get_supabase
from app.schemas.progress import ProgressUpdateRequest, ProgressUpdateResponse

router = APIRouter()


@router.post("/progress/update", response_model=ProgressUpdateResponse)
async def update_progress(
    request: ProgressUpdateRequest,
    user_id: str = Depends(get_current_user_id),
):
    """
    Marks a roadmap step complete/incomplete and recalculates the
    roadmap's readiness percentage.
    """
    supabase = get_supabase()

    # ------------------------------------------------------------
    # STEP 1 — Confirm this step exists AND belongs to a roadmap
    # owned by the current user. This is the critical security
    # check: without it, a user could pass any step_id and mark
    # someone else's roadmap step complete.
    # ------------------------------------------------------------
    step_result = (
        supabase.table("roadmap_steps")
        .select("id, roadmap_id, roadmaps(profile_id)")
        .eq("id", request.step_id)
        .single()
        .execute()
    )

    if not step_result.data:
        raise HTTPException(status_code=404, detail="Roadmap step not found.")

    roadmap_id = step_result.data["roadmap_id"]
    owner_id = step_result.data["roadmaps"]["profile_id"]

    if owner_id != user_id:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to update this roadmap step.",
        )

    # ------------------------------------------------------------
    # STEP 2 — Update the step's completion state.
    # ------------------------------------------------------------
    supabase.table("roadmap_steps").update(
        {
            "is_completed": request.is_completed,
            "completed_at": datetime.now(timezone.utc).isoformat()
            if request.is_completed
            else None,
        }
    ).eq("id", request.step_id).execute()

    # ------------------------------------------------------------
    # STEP 3 — Recalculate readiness for this roadmap. Blends
    # assessed skill levels (same deterministic math as before)
    # with the fraction of roadmap steps completed.
    # ------------------------------------------------------------
    all_steps_result = (
        supabase.table("roadmap_steps")
        .select("is_completed")
        .eq("roadmap_id", roadmap_id)
        .execute()
    )
    all_steps = all_steps_result.data or []
    total_steps = len(all_steps)
    completed_steps = sum(1 for s in all_steps if s["is_completed"])

    step_completion_ratio = (
        completed_steps / total_steps if total_steps > 0 else 0
    )

    # Fetch the roadmap's career to recompute the skill-based
    # readiness component fresh (in case skills changed too).
    roadmap_result = (
        supabase.table("roadmaps")
        .select("career_id")
        .eq("id", roadmap_id)
        .single()
        .execute()
    )
    career_id = roadmap_result.data["career_id"]

    requirements_result = (
        supabase.table("career_skills")
        .select("skill_id, required_level")
        .eq("career_id", career_id)
        .execute()
    )
    requirements = requirements_result.data or []

    skill_ids = [r["skill_id"] for r in requirements]
    user_skills_result = (
        supabase.table("user_skills")
        .select("skill_id, assessed_level")
        .eq("profile_id", user_id)
        .in_("skill_id", skill_ids)
        .execute()
    )
    user_skill_levels = {
        row["skill_id"]: row["assessed_level"] or 0
        for row in (user_skills_result.data or [])
    }

    total_required = 0
    total_current = 0
    for req in requirements:
        required_level = req["required_level"] or 0
        current_level = user_skill_levels.get(req["skill_id"], 0)
        total_required += required_level
        total_current += min(current_level, required_level)

    skill_based_readiness = (
        (total_current / total_required) if total_required > 0 else 0
    )

    # Blend: 70% weight on actual assessed skill, 30% weight on
    # roadmap step completion — skill level matters more, but
    # following the plan still counts for something.
    blended_readiness = round(
        (skill_based_readiness * 0.7 + step_completion_ratio * 0.3) * 100
    )

    supabase.table("roadmaps").update(
        {"readiness_percentage": blended_readiness}
    ).eq("id", roadmap_id).execute()

    return ProgressUpdateResponse(
        step_id=request.step_id,
        is_completed=request.is_completed,
        roadmap_id=roadmap_id,
        completed_steps=completed_steps,
        total_steps=total_steps,
        readiness_percentage=blended_readiness,
    )