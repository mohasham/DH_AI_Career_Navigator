"""
Profile endpoints: create, read, and update the current user's
profile row in Supabase.

All three endpoints require a valid, logged-in user (enforced by
the get_current_user_id dependency) and only ever read/write that
SAME user's row — never anyone else's. This matches the Row Level
Security policies already set on the `profiles` table in Supabase,
giving us two layers of protection: this check here, and the
database's own RLS as a backstop.
"""

from fastapi import APIRouter, Depends, HTTPException
from app.core.auth import get_current_user_id
from app.db.database import get_supabase
from app.schemas.profile import ProfileCreate, ProfileUpdate, ProfileResponse

router = APIRouter()


@router.post("/profile", response_model=ProfileResponse)
async def create_profile(
    profile: ProfileCreate,
    user_id: str = Depends(get_current_user_id),
):
    """
    Creates the profile row for the current user, right after they
    finish the onboarding form for the first time.

    The profile's id is always set to the authenticated user's own
    id (from the token, not from anything the frontend sends) — this
    is what guarantees a user can never create a profile under
    someone else's account, even if they tried to tamper with the
    request.
    """
    supabase = get_supabase()

    data = profile.model_dump()
    data["id"] = user_id

    result = supabase.table("profiles").insert(data).execute()

    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to create profile.")

    return result.data[0]


@router.get("/profile", response_model=ProfileResponse)
async def get_profile(user_id: str = Depends(get_current_user_id)):
    """
    Returns the current user's own profile. Used when a page needs
    to display or pre-fill the user's existing profile data (e.g.
    the dashboard, or re-opening the profile form to edit it).
    """
    supabase = get_supabase()

    result = (
        supabase.table("profiles")
        .select("*")
        .eq("id", user_id)
        .single()
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Profile not found.")

    return result.data


@router.put("/profile", response_model=ProfileResponse)
async def update_profile(
    profile: ProfileUpdate,
    user_id: str = Depends(get_current_user_id),
):
    """
    Updates the current user's existing profile. Only the fields
    actually provided in the request are changed — model_dump with
    exclude_unset=True skips any field the frontend didn't include,
    so a partial update never accidentally wipes out other fields.
    """
    supabase = get_supabase()

    # exclude_unset=True: only include fields the client actually
    # sent, so omitted fields are left untouched in the database
    # rather than being overwritten with None.
    data = profile.model_dump(exclude_unset=True)

    if not data:
        raise HTTPException(status_code=400, detail="No fields provided to update.")

    result = (
        supabase.table("profiles")
        .update(data)
        .eq("id", user_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Profile not found.")

    return result.data[0]
