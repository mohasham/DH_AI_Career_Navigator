"use client";

/**
 * ===================================================================
 * MOBILE MENU
 * ===================================================================
 * Hamburger menu shown only below the md breakpoint, where the
 * landing page's desktop nav links (How it works, Career matching,
 * Roadmap, AI guide) are hidden and otherwise completely
 * inaccessible. Tapping the icon opens a full-width dropdown panel
 * with those same links, plus the same session-aware auth actions
 * as the desktop header.
 *
 * "use client" is required here for the same reason as
 * AuthNavButtons: useState (open/closed) and an onClick handler
 * only work in the browser, not in a Server Component.
 * ===================================================================
 */

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useUser } from "@/lib/auth/use-user";
import { createClient } from "@/lib/auth/supabase-client";
import { useRouter } from "next/navigation";

// Nav links kept in one array so the same list can't drift out of
// sync between what's rendered and what's iterated over.
const NAV_LINKS = [
  { href: "#journey", label: "How it works" },
  { href: "#matching", label: "Career matching" },
  { href: "#roadmap", label: "Roadmap" },
  { href: "#ai-guide", label: "AI guide" },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const { user, loading } = useUser();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    // md:hidden: this entire component — button and panel — only
    // ever renders below the md breakpoint. On desktop, the regular
    // nav links and AuthNavButtons already handle everything.
    <div className="lg:hidden">
      {/* HAMBURGER / CLOSE TOGGLE BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close menu" : "Open menu"}
        className="
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-lg
          text-brand-navy
          hover:bg-slate-50
          transition
        "
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* DROPDOWN PANEL — only rendered when open, avoiding any
          layout impact when closed. Positioned to sit directly
          below the sticky header. */}
      {open && (
        <div
          className="
            absolute
            left-0
            right-0
            top-20
            z-40
            border-b
            border-slate-100
            bg-white
            px-6
            py-6
            shadow-lg
          "
        >
          {/* Nav links */}
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="
                  rounded-lg
                  px-3
                  py-3
                  text-sm
                  font-medium
                  text-slate-600
                  hover:bg-slate-50
                  hover:text-brand-accent
                  transition
                "
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Divider */}
          <div className="my-4 h-px bg-slate-100" />

          {/* Auth actions — mirrors AuthNavButtons' logged-in/out
              logic, since this panel needs its own copy of those
              actions rather than reusing that component directly
              (different layout: stacked full-width here, not inline). */}
          {!loading && (
            <div className="flex flex-col gap-2">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="
                      rounded-lg
                      px-3
                      py-3
                      text-center
                      text-sm
                      font-semibold
                      text-brand-navy
                      hover:bg-slate-50
                      transition
                    "
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="
                      rounded-lg
                      bg-brand-accent
                      px-3
                      py-3
                      text-sm
                      font-semibold
                      text-white
                      hover:bg-brand-navy
                      transition
                    "
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    onClick={() => setOpen(false)}
                    className="
                      rounded-lg
                      px-3
                      py-3
                      text-center
                      text-sm
                      font-semibold
                      text-brand-navy
                      hover:bg-slate-50
                      transition
                    "
                  >
                    Log in
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setOpen(false)}
                    className="
                      rounded-lg
                      bg-brand-accent
                      px-3
                      py-3
                      text-center
                      text-sm
                      font-semibold
                      text-white
                      hover:bg-brand-navy
                      transition
                    "
                  >
                    Get started
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
