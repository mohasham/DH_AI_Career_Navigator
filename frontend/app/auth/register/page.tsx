"use client";

/**
 * ===================================================================
 * REGISTER PAGE — AI CAREER NAVIGATOR
 * ===================================================================
 *
 * This page is a Client Component because the registration form needs:
 * 1. useState to store the user's input.
 * 2. Event handlers such as onChange and onSubmit.
 * 3. Supabase Auth to register the user from the browser.
 * 4. useRouter to redirect the user after registration.
 *
 * PROJECT-WIDE RULE: pages with forms/live state use "use client".
 * Anything needing a SECRET key (Groq key, Supabase service_role key)
 * lives only in FastAPI — never in a Next.js "use server" action —
 * so there's a single place to audit for security.
 *
 * -------------------------------------------------------------------
 * LAYOUT NOTES
 * -------------------------------------------------------------------
 * - h-screen + overflow-hidden on the outer container: locks the
 *   page to exactly the viewport height, so no page-level scrollbar
 *   can ever appear.
 * - Both inner panels also use overflow-hidden (not overflow-y-auto)
 *   so NEITHER panel can ever show a scrollbar either.
 * - Left panel content is vertically centered as one group
 *   (justify-center) rather than spread top-to-bottom.
 * - Left panel is 48% width. The description and illustration have
 *   no narrow max-width cap, so they use the panel's actual
 *   available width.
 * - The form on the right is capped at max-w-md.
 * - On mobile (below md), the branded panel is hidden entirely and
 *   a small logo header appears at the top of the form instead.
 *
 * -------------------------------------------------------------------
 * AUTH / VALIDATION NOTES
 * -------------------------------------------------------------------
 * - Email confirmation is currently DISABLED in Supabase (Authentication
 *   → Sign In / Providers → Email → "Confirm email" toggled off) so
 *   we can test registration quickly during development without
 *   hitting Supabase's free-tier email rate limits. This MUST be
 *   turned back ON before real deployment.
 * - Password rules (8+ chars, 1 uppercase, 1 number) and the
 *   "passwords match" check are enforced here on the CLIENT for
 *   instant feedback only — not a security boundary. Supabase has
 *   its own (weaker, length-only) minimum on its side as a backstop.
 * - Google sign-up uses the same Supabase OAuth flow as the login
 *   page, but redirects to /onboarding instead of /dashboard, since
 *   a first-time Google sign-in creates a brand new Supabase user
 *   with no profile yet — same destination as a normal email/password
 *   registration.
 * ===================================================================
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/auth/supabase-client";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // New: stores the "confirm password" field's value so we can
  // check it matches the main password before submitting.
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!fullName || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    // ----- Password strength validation -----
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least one uppercase letter.");
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError("Password must contain at least one number.");
      return;
    }

    // ----- Confirm password matches -----
    // Catches typos before they turn into a locked-out account.
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    router.push("/onboarding");
  }

  // GOOGLE SIGN-UP — same OAuth flow as the login page's Google
  // button, but redirects to /onboarding since a first-time Google
  // sign-in creates a brand new Supabase user with no profile yet.
  // signInWithOAuth navigates the whole browser tab to Google's own
  // sign-in page; Supabase brings the user back via redirectTo once
  // Google confirms their identity, so no manual redirect is needed
  // here afterward.
async function handleGoogleRegister() {
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
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
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo-icon.png"
            alt="AI Career Navigator"
            width={32}
            height={32}
          />
          <span className="font-bold text-base">
            AI <span className="text-blue-300">Career Navigator</span>
          </span>
        </Link>

        <h1 className="text-3xl font-bold leading-tight mt-8">
          Know exactly
          <br />
          what to learn next.
        </h1>

        <p className="text-blue-200 text-sm leading-relaxed mt-4">
          Assess your real skills, match to careers that fit, and follow a
          roadmap built just for you.
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

      {/* RIGHT REGISTRATION PANEL */}
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
            Create your account
          </h2>

          <p className="text-brand-muted text-sm mt-1.5 mb-6">
            Start mapping your path to your next career.
          </p>

          <form onSubmit={handleRegister} className="space-y-4">
            <Field label="Full name">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
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

            {/* NEW: CONFIRM PASSWORD FIELD */}
            <Field label="Confirm password">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? "Creating account..." : "Sign up"}
            </button>
          </form>

          {/* Divider — visually separates the email/password form
              above from the OAuth option below. */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-brand-line" />
            <span className="text-xs text-brand-muted">OR</span>
            <div className="flex-1 h-px bg-brand-line" />
          </div>

          {/* GOOGLE SIGN-UP BUTTON — type="button" (not "submit")
              stops this from accidentally triggering the form's
              onSubmit (handleRegister) instead of its own onClick. */}
          <button
            type="button"
            onClick={handleGoogleRegister}
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
            Already have an account?{" "}
            <a href="/auth/login" className="text-brand-accent font-semibold">
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Same reusable Field component as the login page. Since both
 * pages now use this exact component, this is a good candidate to
 * move into components/ui/field.tsx and import in both places,
 * instead of having two identical copies. Worth doing as a small
 * cleanup task once both pages are confirmed working.
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