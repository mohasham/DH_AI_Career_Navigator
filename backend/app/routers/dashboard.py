"""
Dashboard summary endpoint.

GET /dashboard/summary — gathers everything the dashboard page
needs in one call: the user's most recently updated roadmap,
readiness, step progress, and biggest skill gap opportunities for
that career. Picks the MOST RECENTLY UPDATED roadmap as the
"target career" if the user has more than one.
"""

from fastapi import APIRouter, Depends
from app.core.auth import get_current_user_id
from app.db.database import get_supabase
from app.schemas.dashboard import DashboardSummary, DashboardOpportunity

router = APIRouter()


@router.get("/dashboard/summary", response_model=DashboardSummary)
async def get_dashboard_summary(user_id: str = Depends(get_current_user_id)):
    supabase = get_supabase()

    # Most recently updated roadmap = the user's current "active" focus.
    roadmap_result = (
        supabase.table("roadmaps")
        .select("id, career_id, readiness_percentage")
        .eq("profile_id", user_id)
        .order("updated_at", desc=True)
        .limit(1)
        .execute()
    )

    if not roadmap_result.data:
        # No roadmap yet — dashboard shows an empty/onboarding state.
        return DashboardSummary(has_roadmap=False)

    roadmap = roadmap_result.data[0]
    roadmap_id = roadmap["id"]
    career_id = roadmap["career_id"]

    career_result = (
        supabase.table("careers").select("title").eq("id", career_id).single().execute()
    )
    career_title = career_result.data["title"] if career_result.data else "Career"

    steps_result = (
        supabase.table("roadmap_steps")
        .select("title, is_completed, skill_id, skills(name)")
        .eq("roadmap_id", roadmap_id)
        .order("step_order")
        .execute()
    )
    steps = steps_result.data or []
    steps_total = len(steps)
    steps_completed = sum(1 for s in steps if s["is_completed"])

    current_step = next((s for s in steps if not s["is_completed"]), None)
    current_step_title = current_step["title"] if current_step else None

    # Biggest opportunities — same gap calc as careers.py, reused here.
    requirements_result = (
        supabase.table("career_skills")
        .select("skill_id, required_level, importance, skills(name)")
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

    opportunities = []
    for req in requirements:
        required_level = req["required_level"] or 0
        current_level = user_skill_levels.get(req["skill_id"], 0)
        gap = max(required_level - current_level, 0)
        if gap > 0:
            opportunities.append(
                DashboardOpportunity(
                    skill_name=req["skills"]["name"],
                    current_level=current_level,
                    required_level=required_level,
                    gap=gap,
                )
            )

    opportunities.sort(key=lambda o: o.gap, reverse=True)

    return DashboardSummary(
        has_roadmap=True,
        career_id=career_id,
        target_career=career_title,
        readiness_percentage=roadmap["readiness_percentage"] or 0,
        steps_completed=steps_completed,
        steps_total=steps_total,
        opportunities=opportunities[:3],
        current_step_title=current_step_title,
    )