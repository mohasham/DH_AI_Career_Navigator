/**
 * ===================================================================
 * AUTHENTICATED API CLIENT
 * ===================================================================
 * Central place for every frontend call to our FastAPI backend.
 *
 * This is React's answer to "dependency injection" for this concern:
 * rather than each page manually fetching the Supabase session and
 * attaching an Authorization header itself, every page just calls
 * apiGet()/apiPost()/apiPut() and this file handles getting and
 * injecting the token internally. Callers never see or think about
 * auth — the dependency (the token) is supplied for them.
 *
 * -------------------------------------------------------------------
 * WHAT CHANGED FROM THE ORIGINAL SPRINT 0 VERSION
 * -------------------------------------------------------------------
 * The original version (used only to test the frontend↔backend
 * connection against the public /health endpoint) had no auth at
 * all — it just called fetch() directly with no headers. Now that
 * we have real protected endpoints (like /profile, which requires
 * Depends(get_current_user_id) on the backend), every request needs
 * to prove who's asking by attaching the user's Supabase access
 * token. That's what getAuthHeader() below adds.
 * ===================================================================
 */

import { createClient } from "@/lib/auth/supabase-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * -------------------------------------------------------------------
 * getAuthHeader (NEW)
 * -------------------------------------------------------------------
 * Gets the current logged-in user's Supabase access token and
 * formats it as an Authorization header. FastAPI's
 * get_current_user_id dependency (app/core/auth.py) reads this
 * exact header on every protected request to verify the request
 * is coming from a real, logged-in user — and to know WHICH user,
 * so e.g. GET /profile only ever returns that person's own data.
 *
 * Throws if there's no active session, since calling a protected
 * endpoint while logged out should fail clearly and immediately,
 * rather than silently sending a request with no token and getting
 * a confusing 401 back from the server.
 */
async function getAuthHeader(): Promise<Record<string, string>> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();



  if (!session) {
    throw new Error("Not authenticated.");
      
  }
  console.log("🔑 ACCESS TOKEN:", session.access_token);
  return { Authorization: `Bearer ${session.access_token}` };
    
}

/**
 * -------------------------------------------------------------------
 * apiGet (UPDATED — now attaches the auth header)
 * -------------------------------------------------------------------
 * Use for any GET request to a protected FastAPI endpoint, e.g.
 * apiGet("/profile") to fetch the current user's profile.
 */
export async function apiGet<T>(path: string): Promise<T> {
  const authHeader = await getAuthHeader();

  const res = await fetch(`${API_URL}${path}`, {
    headers: authHeader,
  });

  if (!res.ok) {
    // Try to read FastAPI's actual error message (HTTPException's
    // "detail" field) instead of just showing a generic status code —
    // this gives far more useful errors, e.g. "Profile not found."
    // instead of just "API error: 404".
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail || `API error: ${res.status}`);
  }

  return res.json();
}

/**
 * -------------------------------------------------------------------
 * apiPost (UPDATED — now attaches the auth header)
 * -------------------------------------------------------------------
 * Use for any POST request to a protected FastAPI endpoint, e.g.
 * apiPost("/profile", formData) to create the current user's
 * profile for the first time.
 */
export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const authHeader = await getAuthHeader();

  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    throw new Error(errBody?.detail || `API error: ${res.status}`);
  }

  return res.json();
}

/**
 * -------------------------------------------------------------------
 * apiPut (NEW — didn't exist in the Sprint 0 version)
 * -------------------------------------------------------------------
 * Use for any PUT request to a protected FastAPI endpoint, e.g.
 * apiPut("/profile", updatedFields) to edit an existing profile.
 * Added now because the backend's PUT /profile endpoint didn't
 * exist until this feature — Sprint 0 only had GET and POST for
 * the basic health-check connection test.
 */
export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const authHeader = await getAuthHeader();

  const res = await fetch(`${API_URL}${path}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    throw new Error(errBody?.detail || `API error: ${res.status}`);
  }

  return res.json();
}