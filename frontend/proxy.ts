/**
 * ===================================================================
 * AUTH MIDDLEWARE — ROUTE PROTECTION
 * ===================================================================
 *
 * Runs on EVERY request, before any page component renders. Checks
 * whether the visitor has an active Supabase session; if not, and
 * they're trying to reach a page that requires login, redirects
 * them to /auth/login instead of letting the page load.
 *
 * WHY MIDDLEWARE (not a check inside each page):
 * Doing this in middleware means we write the protection logic ONCE,
 * here, instead of repeating an "if not logged in, redirect" check
 * inside every single protected page (dashboard, onboarding, profile,
 * assessment, etc.). Adding a new protected page later just means
 * adding its path to the list below — no new auth code needed on
 * that page itself.
 * ===================================================================
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Every route path that requires a logged-in user. Add new protected
// pages here as we build them (profile, assessment, matches, etc.)
const PROTECTED_PATHS = [
  "/dashboard",
  "/onboarding",
  "/profile",
  "/assessment",
  "/matches",
  "/gap",
  "/roadmap",
  "/chat",
  "/settings",
];

export async function proxy(request: NextRequest) {
  const response = NextResponse.next();

  // Creates a Supabase client that can read the session from the
  // incoming request's cookies (this is the server-side equivalent
  // of the browser client we use in lib/auth/supabase-client.ts).
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Checks if there's a valid, active session for this request.
  const { data: { session } } = await supabase.auth.getSession();

  const path = request.nextUrl.pathname;
  const isProtectedPath = PROTECTED_PATHS.some((p) => path.startsWith(p));

  // No session, but trying to reach a protected page → redirect to login.
  if (isProtectedPath && !session) {
    const loginUrl = new URL("/auth/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

/**
 * Tells Next.js which paths this middleware should even run on.
 * Excluding static files, images, and Next.js internals keeps this
 * check from running on every single asset request unnecessarily.
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo-icon.png|logo-lockup.png|onboarding-illustration.png).*)",
  ],
};