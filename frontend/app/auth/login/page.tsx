"use client";

/**
 * ===================================================================
 * LOGIN PAGE — AI CAREER NAVIGATOR
 * ===================================================================
 *
 * Client Component for the same reasons as the register page:
 * useState for form fields, onSubmit handler, and a client-side
 * Supabase Auth call that needs to set the session cookie in the
 * browser immediately.
 *
 * This page reuses the exact same branded layout, spacing, and
 * Field component as the register page, for visual consistency
 * across the auth flow. The only real differences are:
 *   - Only email + password fields (no full name, no confirm password)
 *   - Calls supabase.auth.signInWithPassword() instead of signUp()
 *   - Redirects to /dashboard instead of /onboarding, since a
 *     returning user has already completed onboarding
 *   - Heading/copy on the left panel is tailored to a returning user
 *   - Now also offers "Continue with Google" via Supabase OAuth
 * ===================================================================
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/auth/supabase-client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push("/dashboard");
  }

  // GOOGLE LOGIN — uses Supabase's OAuth flow instead of email/password.
  // signInWithOAuth navigates the whole browser tab to Google's own
  // sign-in page; there's no need to manually redirect afterward,
  // since Supabase handles bringing the user back via redirectTo
  // once Google confirms their identity.
  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
  }

  return (
    <div className="h-screen overflow-hidden flex font-sans">
      {/* LEFT BRANDED PANEL */}
      <div
        className="
          hidden
          md:flex
          md:w-[48%]
          flex-col
          justify-center
          overflow-hidden
          pt-8
          pr-8
          pb-8
          pl-16
          lg:pr-10
          lg:pl-20
          bg-gradient-to-br
          from-brand-navy
          to-brand-navy-dark
          text-white
          relative
        "
      >
        <div className="flex items-center gap-2.5">
          <Image
            src="/logo-icon.png"
            alt="AI Career Navigator"
            width={32}
            height={32}
          />
          <span className="font-bold text-base">
            AI <span className="text-blue-300">Career Navigator</span>
          </span>
        </div>

        <h1 className="text-3xl font-bold leading-tight mt-8">
          Welcome back.
          <br />
          Let's keep going.
        </h1>

        <p className="text-blue-200 text-sm leading-relaxed mt-4">
          Pick up right where you left off — your roadmap, your
          progress, your next step.
        </p>

        <div className="mt-6">
          <Image
            src="/onboarding-illustration.png"
            alt="Person navigating their career"
            width={280}
            height={185}
            className="object-contain"
          />
        </div>

        <div className="text-sm text-blue-300/80 mt-8">
          Map your skills. Navigate your career.
        </div>
      </div>

      {/* RIGHT LOGIN PANEL */}
      <div
        className="
          flex-1
          flex
          flex-col
          justify-center
          px-6
          py-6
          md:px-8
          lg:px-12
          bg-white
          overflow-hidden
        "
      >
        <div className="flex md:hidden items-center gap-2.5 mb-6 justify-center">
          <Image
            src="/logo-icon.png"
            alt="AI Career Navigator"
            width={28}
            height={28}
          />
          <span className="font-bold text-base text-brand-navy">
            AI <span className="text-brand-accent">Career Navigator</span>
          </span>
        </div>

        <div className="max-w-md mx-auto w-full">
          <h2 className="text-xl font-bold text-brand-navy">
            Welcome back
          </h2>

          <p className="text-brand-muted text-sm mt-1.5 mb-6">
            Sign in to continue to your dashboard.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <Field label="Email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="
                  w-full
                  h-11
                  border
                  border-brand-line
                  rounded-lg
                  px-3.5
                  text-sm
                  text-brand-ink
                  outline-none
                  focus:border-brand-accent
                  focus:ring-2
                  focus:ring-brand-accent-soft
                  transition
                "
              />
            </Field>

            <Field label="Password">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="
                  w-full
                  h-11
                  border
                  border-brand-line
                  rounded-lg
                  px-3.5
                  text-sm
                  text-brand-ink
                  outline-none
                  focus:border-brand-accent
                  focus:ring-2
                  focus:ring-brand-accent-soft
                  transition
                "
              />
            </Field>

            {error && (
              <p
                className="
                  text-sm
                  text-red-700
                  bg-red-50
                  px-3.5
                  py-2.5
                  rounded-lg
                "
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                bg-brand-accent
                text-white
                font-semibold
                text-sm
                rounded-lg
                py-3
                mt-1.5
                hover:bg-brand-navy
                transition
                disabled:opacity-70
                disabled:cursor-default
              "
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-brand-line" />
            <span className="text-xs text-brand-muted">OR</span>
            <div className="flex-1 h-px bg-brand-line" />
          </div>

          {/* GOOGLE SIGN-IN BUTTON */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="
              w-full
              flex
              items-center
              justify-center
              gap-2.5
              border
              border-brand-line
              rounded-lg
              py-3
              text-sm
              font-semibold
              text-brand-ink
              hover:bg-gray-50
              transition
            "
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 009 18z"/>
              <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 013.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 000 9c0 1.45.35 2.83.96 4.05l3.01-2.33z"/>
              <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 00.96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-sm text-brand-muted text-center mt-5">
            New here?{" "}
            <a href="/auth/register" className="text-brand-accent font-semibold">
              Create an account
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Same reusable Field component as the register page. Since both
 * pages now use this exact component, this is a good candidate to
 * move into components/ui/field.tsx and import in both places,
 * instead of having two identical copies. Worth doing as a small
 * cleanup task once the login page is confirmed working.
 */
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-brand-ink mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}