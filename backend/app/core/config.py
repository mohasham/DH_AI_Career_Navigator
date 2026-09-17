"""
Application configuration.

Loads all environment variables (from the .env file) into a single,
typed settings object. Using pydantic-settings means every value is
validated and autocompleted in your editor, instead of scattering
os.getenv() calls throughout the codebase.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Supabase project credentials — used for auth and database access.
    # NEVER hardcode these values here; they must come from .env only.
    supabase_url: str = ""
    supabase_service_key: str = ""

    # Direct Postgres connection string (used if we query the DB directly
    # instead of going through the Supabase client).
    database_url: str = ""

    # Groq API key — powers the AI roadmap generation and career chat.
    groq_api_key: str = ""

    # Which frontend origin is allowed to call this API (CORS).
    # In production this should be the deployed Vercel URL, not localhost.
    allowed_origins: str = "http://localhost:3000"

    class Config:
        # Tells pydantic-settings to read values from a local .env file.
        env_file = ".env"


# Single shared settings instance — import this anywhere you need config,
# e.g. `from app.core.config import settings`
settings = Settings()