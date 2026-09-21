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