/**
 * ===================================================================
 * OAUTH CALLBACK ROUTE
 * ===================================================================
 * Google (and any other OAuth provider) redirects here after the
 * user approves sign-in, with a one-time `code` in the URL. This
 * route exchanges that code for a real Supabase session BEFORE
 * sending the user onward — this guarantees the session actually
 * exists by the time proxy.ts checks for it on the next page,
 * fixing the redirect-back-to-login bug caused by a race condition
 * between the OAuth redirect and session creation.
 * ===================================================================
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // "next" lets the login/register pages specify where to go after
  // a successful sign-in (e.g. /dashboard or /onboarding), passed
  // through as part of the redirectTo URL.
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const response = NextResponse.redirect(`${origin}${next}`);

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

    // This is the actual session-creation step — exchanges the
    // one-time code for a real session and writes it to cookies.
    await supabase.auth.exchangeCodeForSession(code);

    return response;
  }

  // No code present — something went wrong, send back to login.
  return NextResponse.redirect(`${origin}/auth/login`);
}
