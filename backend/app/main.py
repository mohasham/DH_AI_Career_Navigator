"""
FastAPI application entry point.

This is the file that gets run to start the backend server:
    uvicorn app.main:app --reload --port 8000

It creates the FastAPI app, configures CORS so the Next.js frontend
can call it, and defines basic health check routes. Feature-specific
routes (auth, profile, assessment, etc.) will be added later as
separate "routers" and included here — keeping this file small.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

# Create the FastAPI application instance.
# title/version show up automatically in the auto-generated API docs
# at http://localhost:8000/docs
app = FastAPI(
    title="AI Career Navigator API",
    version="1.0.0",
)

# ---------------------------------------------------------------------
# CORS (Cross-Origin Resource Sharing)
# ---------------------------------------------------------------------
# Browsers block frontend JavaScript from calling a different domain/port
# unless the backend explicitly allows it. Since Next.js (port 3000) and
# FastAPI (port 8000) run on different ports during development, we need
# this middleware or every API call from the frontend will fail silently.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.allowed_origins],  # e.g. http://localhost:3000
    allow_credentials=True,                    # allows cookies/auth headers
    allow_methods=["*"],                       # allow GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],                       # allow any request headers
)


# ---------------------------------------------------------------------
# Basic routes
# ---------------------------------------------------------------------

@app.get("/")
def root():
    """
    Root endpoint — just confirms the API is reachable at all.
    Useful for a quick sanity check in the browser.
    """
    return {"message": "AI Career Navigator API is running"}


@app.get("/health")
def health_check():
    """
    Health check endpoint.

    Used by:
    - You, to confirm the server started correctly during local dev.
    - Deployment platforms (Railway/Render), which often ping this
      endpoint to confirm the service is alive before routing traffic to it.
    """
    return {"status": "ok"}


# ---------------------------------------------------------------------
# Feature routers
# ---------------------------------------------------------------------
# Each feature's routes live in their own file inside app/routers/,
# keeping this main.py file clean as the project grows. We import
# the router object from each file and "mount" it onto the main app.
from app.routers import profile , assessment

# No prefix here since profile.py's routes are already defined as
# "/profile" directly (e.g. @router.post("/profile")) — adding a
# prefix would double it up into "/profile/profile".
app.include_router(profile.router, tags=["Profile"])
app.include_router(assessment.router, tags=["Assessment"])