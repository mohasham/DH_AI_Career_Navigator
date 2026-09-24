"""
Endpoint for saving a user's selected skills during onboarding.

POST /profile/skills — records which REAL skills (by skill_id) a
user claims to have, as user_skills rows with source='selected'
and assessed_level=0 (not yet verified). This is intentionally
separate from assessed_level='tested'/'practiced' — 'selected'
means "the user says they know this, but hasn't proven it yet."

Only skill_ids that exist in the skills table are ever accepted —
a user can never register a skill that doesn't already exist,
which keeps every skill in the system fully wired to real
assessment questions and career_skills requirements.
"""

from fastapi import APIRouter, Depends, HTTPException
from app.core.auth import get_current_user_id
from app.db.database import get_supabase
from app.schemas.user_skills import SelectSkillsRequest

router = APIRouter()


@router.post("/profile/skills")
async def select_skills(
    request: SelectSkillsRequest,
    user_id: str = Depends(get_current_user_id),
):
    supabase = get_supabase()

    # Validate every skill_id actually exists — reject the whole
    # request if any of them don't, rather than silently ignoring
    # invalid ones.
    real_skills = (
        supabase.table("skills")
        .select("id")
        .in_("id", request.skill_ids)
        .execute()
    )
    real_skill_ids = {s["id"] for s in (real_skills.data or [])}

    invalid_ids = set(request.skill_ids) - real_skill_ids
    if invalid_ids:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid skill IDs: {invalid_ids}",
        )

    # Upsert each selected skill as source='selected'. Skip any
    # that already have a REAL assessed record (tested/practiced) —
    # never overwrite a genuine score with a placeholder selection.
    for skill_id in request.skill_ids:
        existing = (
            supabase.table("user_skills")
            .select("source")
            .eq("profile_id", user_id)
            .eq("skill_id", skill_id)
            .execute()
        )
        if existing.data and existing.data[0]["source"] in ("tested", "practiced"):
            continue  # already has a real score, don't downgrade it

        supabase.table("user_skills").upsert(
            {
                "profile_id": user_id,
                "skill_id": skill_id,
                "assessed_level": 0,
                "source": "selected",
            },
            on_conflict="profile_id,skill_id",
        ).execute()

    return {"selected_count": len(request.skill_ids)}