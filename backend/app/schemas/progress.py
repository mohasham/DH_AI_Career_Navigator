"""
Pydantic schemas for the progress tracking feature.
"""

from pydantic import BaseModel


class ProgressUpdateRequest(BaseModel):
    """
    Shape of the request when a user marks a roadmap step as
    complete or incomplete.
    """
    step_id: int
    is_completed: bool


class ProgressUpdateResponse(BaseModel):
    """
    Shape of the response after updating a step's completion —
    confirms the change and returns the RECALCULATED readiness
    percentage for the roadmap this step belongs to, so the
    frontend can immediately reflect the new progress without a
    separate follow-up request.
    """
    step_id: int
    is_completed: bool
    roadmap_id: int
    completed_steps: int
    total_steps: int
    readiness_percentage: int