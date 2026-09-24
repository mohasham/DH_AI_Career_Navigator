"""
Skills reference data endpoint.

GET /skills — returns the full list of real skills in the system.
Used by the onboarding page's skills selector, so users can only
pick from actual skills that exist (and can later be assessed),
rather than free-typing arbitrary text.

Kept as its own small file rather than folded into careers.py or
assessment.py, since skills are shared reference data used across
multiple features (onboarding, assessment, matching, roadmaps) —
not specific to any one of them.
"""

from fastapi import APIRouter, Depends
from app.core.auth import get_current_user_id
from app.db.database import get_supabase

router = APIRouter()


@router.get("/skills")
async def get_all_skills(user_id: str = Depends(get_current_user_id)):
    """
    Returns every skill in the system, ordered alphabetically.
    """
    supabase = get_supabase()
    result = supabase.table("skills").select("id, name").order("name").execute()
    return {"skills": result.data or []}


@router.get("/skills/my-levels")
async def get_my_skill_levels(user_id: str = Depends(get_current_user_id)):
    """
    Returns every skill alongside the current user's assessed level
    for it (0/null if never assessed), plus whether that level came
    from a real test or self-reported activity. Used by the
    /assessment skill-picker page to show what the user has already
    earned through real testing.
    """
    supabase = get_supabase()

    all_skills_result = (
        supabase.table("skills").select("id, name").order("name").execute()
    )
    all_skills = all_skills_result.data or []

    user_skills_result = (
        supabase.table("user_skills")
        .select("skill_id, assessed_level, source")
        .eq("profile_id", user_id)
        .execute()
    )
    user_levels = {
        row["skill_id"]: {"level": row["assessed_level"] or 0, "source": row["source"]}
        for row in (user_skills_result.data or [])
    }

    result = []
    for skill in all_skills:
        user_data = user_levels.get(skill["id"])
        result.append(
            {
                "skill_id": skill["id"],
                "skill_name": skill["name"],
                "assessed_level": user_data["level"] if user_data else None,
                "source": user_data["source"] if user_data else None,
            }
        )

    return {"skills": result}


@router.get("/skills/my-levels-detailed")
async def get_my_skill_levels_detailed(user_id: str = Depends(get_current_user_id)):
    """
    Returns each selected skill with THREE separate numbers:
    - real_assessment_score: from a real quiz (0 if never tested)
    - practiced_score: capped sum of logged activity points across
      ALL roadmap steps for that skill (0 if none logged)
    - total_score: the final blended value (max of the two, same
      as what's stored in user_skills.assessed_level)

    Used by the /assessment picker page to show a fuller picture
    than the single blended number alone.
    """
    supabase = get_supabase()

    user_skills_result = (
        supabase.table("user_skills")
        .select("skill_id, assessed_level, source, skills(name)")
        .eq("profile_id", user_id)
        .execute()
    )
    user_skills = user_skills_result.data or []

    result = []
    for us in user_skills:
        skill_id = us["skill_id"]
        skill_name = us["skills"]["name"] if us["skills"] else None
        source = us["source"]
        total_score = us["assessed_level"] or 0

        # Real test score: only meaningful if source is "tested" —
        # otherwise the user never took a real assessment for this
        # skill, so their real score is effectively 0.
        real_assessment_score = total_score if source == "tested" else 0

        # Practiced score: sum ALL activity points logged across
        # every roadmap step tied to this skill, capped at 80 —
        # this recomputes fresh rather than trusting a stored value,
        # since activities can be logged across multiple roadmaps.
        steps_result = (
            supabase.table("roadmap_steps")
            .select("id")
            .eq("skill_id", skill_id)
            .execute()
        )
        step_ids = [s["id"] for s in (steps_result.data or [])]

        practiced_score = 0
        if step_ids:
            activities_result = (
                supabase.table("roadmap_step_activities")
                .select("points")
                .in_("step_id", step_ids)
                .execute()
            )
            raw_total = sum(a["points"] for a in (activities_result.data or []))
            practiced_score = min(raw_total, 80)

        result.append(
            {
                "skill_id": skill_id,
                "skill_name": skill_name,
                "real_assessment_score": real_assessment_score,
                "practiced_score": practiced_score,
                "total_score": total_score,
                "source": source,
            }
        )

    return {"skills": result}