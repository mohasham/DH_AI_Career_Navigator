"""
Authentication dependency for FastAPI routes.

FastAPI's "Depends()" system lets us plug this function into any
route that needs to know WHO is making the request. It reads the
Authorization header (sent by the frontend on every API call),
asks Supabase to verify it's a real, valid session, and returns
the user's id — or raises a 401 error if the token is missing or
invalid.

This is what actually enforces "users can only access their own
data" at the API level, on top of the Row Level Security we already
set up directly in the database.
"""

from fastapi import Header, HTTPException
from app.db.database import get_supabase


async def get_current_user_id(authorization: str = Header(None)) -> str:
    """
    Extracts and verifies the current user's id from the request's
    Authorization header. Used as a FastAPI dependency:

        @router.get("/profile")
        async def get_profile(user_id: str = Depends(get_current_user_id)):
            ...
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Missing or invalid Authorization header.",
        )

    # Strip the "Bearer " prefix to get just the raw token.
    token = authorization.replace("Bearer ", "")

    supabase = get_supabase()

    try:
        # Asks Supabase to verify this token is real and not expired,
        # and returns the associated user if valid.
        user_response = supabase.auth.get_user(token)
        user = user_response.user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")

    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")

    return user.id