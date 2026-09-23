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