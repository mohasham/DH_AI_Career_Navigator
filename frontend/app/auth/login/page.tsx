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

    // Basic validation — UX only, not a security check. Supabase
    // itself will reject genuinely invalid credentials on its side.
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    // signInWithPassword checks the email/password against Supabase's
    // stored (hashed) credentials and, if correct, creates an active
    // session — setting the session cookie in the browser.
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      // Supabase returns a generic "Invalid login credentials" message
      // for both wrong password AND non-existent email — this is
      // intentional on Supabase's part, so an attacker can't use the
      // error message to discover which emails are registered.
      setError(signInError.message);
      return;
    }

    // Login succeeded — send the user to their dashboard (not
    // onboarding, since a returning user already has a profile).
    router.push("/dashboard");
  }

  return (
    <div className="h-screen overflow-hidden flex font-sans">
      {/* LEFT BRANDED PANEL — same layout as register, different copy */}
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

        {/* Heading tailored to a returning user, rather than the
            register page's "Know exactly what to learn next." */}
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
        {/* MOBILE-ONLY LOGO HEADER — same as register page */}
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

          {/* Points to register instead of login, mirroring the
              register page's link back to /login */}
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