"""
Pydantic schemas for the career matching feature.
"""

from pydantic import BaseModel
from typing import List


class CareerMatch(BaseModel):
    """
    Shape of a single career match result — the career itself,
    plus a computed compatibility score for the current user.
    """
    career_id: int
    title: str
    description: str
    industry: str
    compatibility_score: int


class CareerMatchesResponse(BaseModel):
    """
    Shape of the full response for GET /careers/match — a ranked
    list of career matches for the current user, best match first.
    """
    matches: List[CareerMatch]


class SkillGap(BaseModel):
    """
    Shape of a single skill's gap for a specific career — the
    skill name, the user's current level, what's required, and
    the numeric gap between them.
    """
    skill_name: str
    current_level: int
    required_level: int
    gap: int
    importance: int


class GapAnalysisResponse(BaseModel):
    """
    Shape of the full response for GET /careers/{id}/gap — the
    career's name plus a breakdown of every required skill,
    ordered so the biggest, most important gaps surface first.
    """
    career_title: str
    skill_gaps: List[SkillGap]