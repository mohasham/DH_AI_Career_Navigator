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
 * ===================================================================
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/auth/supabase-client";

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

          <p className="text-sm text-brand-muted text-center mt-5">
            Already have an account?{" "}
            <a href="/login" className="text-brand-accent font-semibold">
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

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