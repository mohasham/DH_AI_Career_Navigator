"""
Pydantic schemas for the user profile feature.

These define the shape of data going IN to the API (what the
frontend is allowed to send) and OUT of the API (what we return).
FastAPI uses these to automatically validate incoming requests and
generate the interactive API docs at /docs.
"""

from pydantic import BaseModel
from typing import Optional


class ProfileCreate(BaseModel):
    """
    Shape of the data expected when a user submits the profile
    setup form for the first time (POST /profile).
    """
    full_name: str
    education: Optional[str] = None
    experience_years: Optional[int] = None
    interests: Optional[str] = None
    career_goal: Optional[str] = None
    work_preference: Optional[str] = None
    industry_interest: Optional[str] = None


class ProfileUpdate(BaseModel):
    """
    Shape of the data for updating an existing profile (PUT /profile).
    Every field is optional here, since a PUT update might only
    change one or two fields rather than resubmitting everything.
    """
    full_name: Optional[str] = None
    education: Optional[str] = None
    experience_years: Optional[int] = None
    interests: Optional[str] = None
    career_goal: Optional[str] = None
    work_preference: Optional[str] = None
    industry_interest: Optional[str] = None


class ProfileResponse(BaseModel):
    """
    Shape of the data we send BACK to the frontend when a profile
    is created, fetched, or updated. Mirrors the `profiles` table
    columns from our Supabase schema (001_initial_schema.sql).
    """
    id: str
    full_name: Optional[str] = None
    education: Optional[str] = None
    experience_years: Optional[int] = None
    interests: Optional[str] = None
    career_goal: Optional[str] = None
    work_preference: Optional[str] = None
    industry_interest: Optional[str] = None