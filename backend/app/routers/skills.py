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