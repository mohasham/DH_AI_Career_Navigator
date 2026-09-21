"""
Authentication dependency for FastAPI routes.

Uses FastAPI's HTTPBearer security scheme instead of manually
reading a raw Header() — this is what makes Swagger UI show the
lock icon on protected endpoints, letting you authorize once (via
the "Authorize" button) instead of pasting the token into every
single request's fields individually.

Functionally, this does the same thing we already had: read the
Bearer token, verify it with Supabase, return the user's id. The
change is purely about using FastAPI's dedicated security tooling
instead of a manual Header() check — same security guarantee,
better developer experience in the docs.
"""

from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.db.database import get_supabase

# This is what Swagger detects to render the lock icon and the
# "Authorize" button. bearerFormat is just a label shown in the UI.
bearer_scheme = HTTPBearer(bearerFormat="JWT")


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> str:
    """
    Extracts and verifies the current user's id from the request's
    Bearer token. Used as a FastAPI dependency:

        @router.get("/profile")
        async def get_profile(user_id: str = Depends(get_current_user_id)):
            ...

    FastAPI's HTTPBearer already handles checking that an
    Authorization header exists and starts with "Bearer " — if it's
    missing or malformed, FastAPI rejects the request with a 403
    before this function even runs. We only need to verify the
    token itself is a real, valid Supabase session.
    """
    token = credentials.credentials

    supabase = get_supabase()

    try:
        user_response = supabase.auth.get_user(token)
        user = user_response.user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")

    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")

    return user.id