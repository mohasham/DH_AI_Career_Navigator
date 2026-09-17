"""
Database connection helper.

Provides a single function to get a configured Supabase client.
Import this wherever a route or service needs to read/write data,
e.g. `from app.db.database import get_supabase`

We use the service key here (not the public anon key) because this
runs on the backend, where it's safe — it must NEVER be exposed to
the frontend or committed to Git.
"""

from supabase import create_client, Client
from app.core.config import settings


def get_supabase() -> Client:
    """
    Creates and returns a Supabase client authenticated with the
    service role key, giving the backend full read/write access
    to the database, bypassing row-level security policies.
    """
    return create_client(settings.supabase_url, settings.supabase_service_key)