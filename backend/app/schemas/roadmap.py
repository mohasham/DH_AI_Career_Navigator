"""
Pydantic schemas for the personalized roadmap feature.
"""

from pydantic import BaseModel
from typing import List, Optional


class RoadmapGenerateRequest(BaseModel):
    """
    Shape of the request when a user asks for a roadmap toward a
    specific career.
    """
    career_id: int


class RoadmapStepOut(BaseModel):
    """
    Shape of a single step in the generated roadmap.
    """
    step_id: int
    step_order: int
    title: str
    description: str
    skill_name: Optional[str] = None
    resource_url: Optional[str] = None
    is_completed: bool = False


class RoadmapResponse(BaseModel):
    """
    Shape of the full response after generating a roadmap.
    """
    roadmap_id: int
    career_title: str
    readiness_percentage: int
    already_existed: bool = False
    steps: List[RoadmapStepOut]


class RoadmapRecalculateRequest(BaseModel):
    """
    Shape of the request when a user asks to refresh their roadmap
    against their current, possibly-improved skill levels. This
    powers POST /roadmap/recalculate, which detects and removes
    roadmap steps for skills the user has since mastered (e.g. via
    a real assessment retake or capped activity logging), fixing
    the known "stale roadmap" limitation from the original
    generation endpoint.
    """
    roadmap_id: int