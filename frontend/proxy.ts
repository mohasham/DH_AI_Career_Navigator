/**
 * ===================================================================
 * AUTH PROXY — ROUTE PROTECTION
 * ===================================================================
 *
 * Runs on EVERY request, before any page component renders. Checks
 * whether the visitor has an active Supabase session; if not, and
 * they're trying to reach a page that requires login, redirects
 * them to /auth/login instead of letting the page load.
 *
 * (Renamed from middleware.ts to proxy.ts per Next.js 16's renamed
 * file convention — see Next.js docs on "Renaming Middleware to Proxy".)
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

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  const path = request.nextUrl.pathname;
  const isProtectedPath = PROTECTED_PATHS.some((p) => path.startsWith(p));


  if (isProtectedPath && !session) {
    const loginUrl = new URL("/auth/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo-icon.png|logo-lockup.png|onboarding-illustration.png).*)",
  ],
};