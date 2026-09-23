"""
Pydantic schemas for logging self-reported roadmap step activities.
"""

from pydantic import BaseModel
from typing import Optional, List

# Fixed point values per activity type — never invented by AI,
# never user-adjustable. This is the deliberate design that caps
# self-reported credibility below a real assessment.
ACTIVITY_POINTS = {
    "project": 30,
    "video": 15,
    "article": 10,
    "exercise": 15,
}

MAX_PRACTICED_SCORE = 80


class ActivityLogRequest(BaseModel):
    """
    Shape of the request when a user logs an activity toward a
    roadmap step.
    """
    step_id: int
    activity_type: str  # must be one of ACTIVITY_POINTS' keys
    description: Optional[str] = None


class ActivityOut(BaseModel):
    id: int
    activity_type: str
    description: Optional[str]
    points: int


class ActivityLogResponse(BaseModel):
    """
    Shape of the response after logging an activity — includes
    the skill's new capped score and whether a real assessment
    is still the higher, "winning" score.
    """
    step_id: int
    skill_name: Optional[str]
    activities: List[ActivityOut]
    practiced_points_total: int  # sum of activity points, capped at 80
    real_assessment_score: int   # 0 if never assessed
    final_skill_score: int       # max(real_assessment_score, capped total)
    score_source: str            # "tested" or "practiced"