"""
Pydantic schemas for saving a user's selected skills during onboarding.
"""

from pydantic import BaseModel
from typing import List


class SelectSkillsRequest(BaseModel):
    """
    Shape of the request when a user selects which skills they
    claim to have, during onboarding. skill_ids must reference
    real, existing skills — never arbitrary free text.
    """
    skill_ids: List[int]