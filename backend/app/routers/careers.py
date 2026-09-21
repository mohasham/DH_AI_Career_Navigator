"""
Career matching endpoints.

GET /careers/match — computes and returns a ranked list of career
compatibility scores for the current user, based on their real
assessed skill levels compared against each career's requirements.

GET /careers/{career_id}/gap — returns a skill-by-skill gap
analysis for one specific career.

IMPORTANT: both endpoints are calculated ENTIRELY by backend logic
here — never by an LLM — matching the BRD's core design principle
that compatibility scores are deterministic and explainable, not
AI guesses.
"""

from fastapi import APIRouter, Depends, HTTPException
from app.core.auth import get_current_user_id
from app.db.database import get_supabase
from app.schemas.career import (
    CareerMatch,
    CareerMatchesResponse,
    GapAnalysisResponse,
    SkillGap,
)

router = APIRouter()


@router.get("/careers/match", response_model=CareerMatchesResponse)
async def get_career_matches(user_id: str = Depends(get_current_user_id)):
    """
    Computes a compatibility score for every career, based on how
    the user's assessed skills compare to each career's required
    skill levels — weighted by each skill's importance to that
    career. Careers are returned ranked best-match first.

    Scoring approach:
    - For each required skill of a career, we look up the user's
      assessed_level for that skill (0 if never assessed).
    - We compare the user's level against the required level,
      capped at 100% credit per skill (exceeding the requirement
      doesn't inflate the score beyond full credit).
    - Each skill's contribution is weighted by its `importance`
      (1-3), so critical skills matter more than minor ones.
    """
    supabase = get_supabase()

    # Fetch the user's real assessed skills — this is the ONLY
    # source of truth for what the user knows, matching the BRD's
    # requirement that scores come from objective assessment data,
    # not self-reported claims.
    user_skills_result = (
        supabase.table("user_skills")
        .select("skill_id, assessed_level")
        .eq("profile_id", user_id)
        .execute()
    )

    # Build a quick lookup: { skill_id: assessed_level }
    user_skill_levels = {
        row["skill_id"]: row["assessed_level"] or 0
        for row in (user_skills_result.data or [])
    }

    # Fetch every career.
    careers_result = supabase.table("careers").select("*").execute()

    matches = []

    for career in careers_result.data or []:
        # Fetch this career's required skills.
        requirements_result = (
            supabase.table("career_skills")
            .select("skill_id, required_level, importance")
            .eq("career_id", career["id"])
            .execute()
        )

        requirements = requirements_result.data or []

        if not requirements:
            # A career with no defined requirements can't be scored
            # meaningfully — skip it rather than showing a
            # misleading 0% or 100%.
            continue

        total_weight = 0
        earned_weight = 0

        for req in requirements:
            skill_id = req["skill_id"]
            required_level = req["required_level"] or 0
            importance = req["importance"] or 1

            user_level = user_skill_levels.get(skill_id, 0)

            # Credit is capped at 100% of this skill's weight —
            # being far above the requirement doesn't let one
            # skill compensate infinitely for others.
            if required_level > 0:
                skill_credit = min(user_level / required_level, 1.0)
            else:
                skill_credit = 1.0

            total_weight += importance
            earned_weight += skill_credit * importance

        compatibility_score = (
            round((earned_weight / total_weight) * 100) if total_weight > 0 else 0
        )

        matches.append(
            CareerMatch(
                career_id=career["id"],
                title=career["title"],
                description=career["description"],
                industry=career["industry"],
                compatibility_score=compatibility_score,
            )
        )

    # Rank best match first.
    matches.sort(key=lambda m: m.compatibility_score, reverse=True)

    return CareerMatchesResponse(matches=matches)


@router.get("/careers/{career_id}/gap", response_model=GapAnalysisResponse)
async def get_career_gap(
    career_id: int,
    user_id: str = Depends(get_current_user_id),
):
    """
    Returns a skill-by-skill gap analysis for a specific career:
    the user's current assessed level vs. what's required, for
    every skill that career needs.

    Deliberately no separate "gap" table exists in the schema —
    this is calculated live by comparing user_skills.assessed_level
    against career_skills.required_level, exactly as documented in
    the ERD's design notes (avoids stale, duplicated data that
    would need to be kept in sync separately).
    """
    supabase = get_supabase()

    # Confirm the career exists.
    career_result = (
        supabase.table("careers")
        .select("id, title")
        .eq("id", career_id)
        .single()
        .execute()
    )

    if not career_result.data:
        raise HTTPException(status_code=404, detail="Career not found.")

    career_title = career_result.data["title"]

    # Fetch this career's required skills, joined with the skill's
    # actual name (career_skills only stores skill_id).
    requirements_result = (
        supabase.table("career_skills")
        .select("skill_id, required_level, importance, skills(name)")
        .eq("career_id", career_id)
        .execute()
    )

    requirements = requirements_result.data or []

    if not requirements:
        raise HTTPException(
            status_code=404,
            detail="No skill requirements defined for this career.",
        )

    # Fetch the user's assessed levels for exactly the skills this
    # career needs, so someone with many assessed skills doesn't
    # waste a broader unfiltered query.
    skill_ids = [req["skill_id"] for req in requirements]
    user_skills_result = (
        supabase.table("user_skills")
        .select("skill_id, assessed_level")
        .eq("profile_id", user_id)
        .in_("skill_id", skill_ids)
        .execute()
    )

    # TEMPORARY DEBUG — investigating why a known assessed skill
    # (Python at 22%, confirmed directly in Supabase Table Editor
    # with a matching profile_id) still shows as 0 in the gap
    # response. Expanded to show types and an UNFILTERED query for
    # this same user, to isolate whether the issue is in the
    # .in_(skill_ids) filter specifically or something broader with
    # how user_id/profile_id is being matched. Remove all of this
    # block once the cause is confirmed and fixed.


    debug_all_skills = (
        supabase.table("user_skills")
        .select("skill_id, assessed_level, profile_id")
        .eq("profile_id", user_id)
        .execute()
    )


    user_skill_levels = {
        row["skill_id"]: row["assessed_level"] or 0
        for row in (user_skills_result.data or [])
    }

    skill_gaps = []
    for req in requirements:
        skill_id = req["skill_id"]
        required_level = req["required_level"] or 0
        current_level = user_skill_levels.get(skill_id, 0)
        # Gap never shown as negative — being ABOVE the requirement
        # is just "no gap" (0), not a bonus to display here.
        gap = max(required_level - current_level, 0)

        skill_gaps.append(
            SkillGap(
                skill_name=req["skills"]["name"],
                current_level=current_level,
                required_level=required_level,
                gap=gap,
                importance=req["importance"] or 1,
            )
        )

    # Order so the biggest, most important gaps surface first —
    # this is exactly what the roadmap generator (Sprint 5) will
    # need to prioritize what to teach first.
    skill_gaps.sort(key=lambda g: (g.gap * g.importance), reverse=True)

    return GapAnalysisResponse(career_title=career_title, skill_gaps=skill_gaps)