"""
Pydantic schemas for the dashboard summary endpoint.
"""

from pydantic import BaseModel
from typing import List, Optional


class DashboardOpportunity(BaseModel):
    skill_name: str
    current_level: int
    required_level: int
    gap: int


class DashboardSummary(BaseModel):
    """
    Everything the dashboard page needs in one response — avoids
    the frontend making several separate calls on load.
    """
    has_roadmap: bool
    career_id: Optional[int] = None
    target_career: Optional[str] = None
    readiness_percentage: int = 0
    steps_completed: int = 0
    steps_total: int = 0
    opportunities: List[DashboardOpportunity] = []
    current_step_title: Optional[str] = None