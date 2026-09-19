"use client";

/**
 * ===================================================================
 * AUTH NAV BUTTONS
 * ===================================================================
 * Small client component used in the header of pages like the
 * landing page. Shows "Log in" + "Get started" when logged out,
 * or "Dashboard" + "Log out" when a session exists.
 *
 * Kept as its own tiny Client Component rather than converting the
 * whole landing page to "use client" — this way the landing page's
 * marketing content stays server-rendered (better performance/SEO),
 * and only this small interactive piece ships extra JS to the browser.
 * ===================================================================
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/auth/use-user";
import { createClient } from "@/lib/auth/supabase-client";

export function AuthNavButtons() {
  const { user, loading } = useUser();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh(); // ensures the header re-checks session state immediately
  }

  // While the session is still being checked, render nothing to
  // avoid a flash of "Log in" buttons for users who are actually
  // already logged in.
  if (loading) return null;

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-brand-navy hover:text-brand-accent transition"
        >
          Dashboard
        </Link>
        <button
          onClick={handleLogout}
          className="
            bg-brand-accent
            text-white
            text-sm
            font-semibold
            rounded-lg
            px-5
            py-2.5
            hover:bg-brand-navy
            transition
          "
        >
          Log out
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/auth/login"
        className="text-sm font-semibold text-brand-navy hover:text-brand-accent transition"
      >
        Log in
      </Link>
      <Link
        href="/auth/register"
        className="
          bg-brand-accent
          text-white
          text-sm
          font-semibold
          rounded-lg
          px-5
          py-2.5
          hover:bg-brand-navy
          transition
        "
      >
        Sign up
      </Link>
    </div>
  );
}
