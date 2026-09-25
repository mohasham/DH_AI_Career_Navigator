"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  BarChart3,
  BrainCircuit,
  BriefcaseBusiness,
  Compass,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Route,
  Settings,
  X,
} from "lucide-react";
import { createClient } from "@/lib/auth/supabase-client";
import { apiGet } from "@/lib/api/client";

/**
 * =====================================================================
 * SHARED APP LAYOUT — sidebar + header, persistent across pages
 * =====================================================================
 *
 * FILE:
 * frontend/app/(app)/layout.tsx
 *
 * The (app) folder name is a Next.js "route group" — the
 * parentheses group these routes together for a shared layout
 * WITHOUT adding "(app)" to the actual URL. /dashboard, /matches,
 * /gap, /roadmap, /assessment all keep their exact same URLs, but
 * now render inside this shared sidebar/header wrapper instead of
 * each having its own separate header.
 *
 * Individual page files (dashboard/page.tsx, roadmap/page.tsx, etc.)
 * now only contain their own inner content — no more duplicate
 * <header> or full-page <main> wrapper in each one.
 *
 * LOGO LINK: unlike the standalone assessment quiz page (which
 * deliberately keeps its logo non-clickable to avoid users
 * accidentally abandoning an in-progress quiz), every page inside
 * this shared layout is freely browsable — so the logo here
 * correctly links back to / (homepage), matching standard web
 * convention. These are two separate files/headers, so this
 * change has no effect on the quiz page's intentionally
 * non-clickable logo.
 *
 * MOBILE NAV: the sidebar is hidden below the lg breakpoint
 * (hidden lg:block) — without a replacement, a mobile user would
 * have NO way to navigate between pages. This hamburger menu +
 * slide-down panel fixes that, reusing the same navigation items
 * as the desktop sidebar.
 * =====================================================================
 */

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const [userName, setUserName] = useState("there");
  const [userEmail, setUserEmail] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [careerId, setCareerId] = useState<number | null>(null);

  useEffect(() => {
    apiGet<{ has_roadmap: boolean; career_id?: number }>("/dashboard/summary")
      .then((data) => {
        if (data.has_roadmap && data.career_id) {
          setCareerId(data.career_id);
        }
      })
      .catch(() => {});
  }, []);

  // Guard: if the user hasn't completed onboarding yet (no profile
  // row exists), redirect them there before showing any dashboard-
  // style pages. GET /profile returns a 404 if no profile exists,
  // which we use as the signal here.
  //
  // SECOND GUARD: even with a profile, if the user still has
  // selected-but-untested skills, redirect them to the assessment
  // picker instead — they must prove every skill they claimed
  // before browsing matches/gap/roadmap/dashboard, ensuring those
  // pages always reflect real, complete assessed data.
  //
  // Depends on `pathname` (not just []) so this re-runs on EVERY
  // navigation within (app) — without this, the layout only mounts
  // once and this check would never re-fire when the user clicks
  // between sidebar links, letting them slip past the gate after
  // the first check.
  useEffect(() => {
    apiGet("/profile")
      .then(() => {
        return apiGet<{
          skills: { skill_name: string; source: string | null }[];
        }>("/skills/my-levels");
      })
      .then((data) => {
        const selectedSkills = data.skills.filter((s) => s.source !== null);
        const hasAnyTested = selectedSkills.some((s) => s.source === "tested");
        const hasUntestedSelected = selectedSkills.some((s) => s.source !== "tested");

        // Only enforce the strict "must test everything first" gate
        // during INITIAL onboarding — i.e. the user has never tested
        // ANY skill yet. Once they've completed onboarding once
        // (at least one tested skill exists), adding more skills
        // later (e.g. via edit profile) should NOT lock them out of
        // browsing — they can test new skills whenever they choose.
        const isStillInInitialOnboarding = !hasAnyTested && hasUntestedSelected;

        if (isStillInInitialOnboarding && pathname !== "/assessment") {
          router.push("/assessment");
        }
      })
      .catch(() => {
        router.push("/onboarding");
      });
  }, [pathname]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const name =
        data.user?.user_metadata?.full_name ||
        data.user?.user_metadata?.name ||
        "there";
      setUserName(name);
      setUserEmail(data.user?.email || "");
    });
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  // Fetches the current career fresh, on click, rather than relying
  // on `careerId` state that might not have finished loading yet on
  // a fast click right after page load — avoids a race condition
  // where clicking too quickly would incorrectly fall back to
  // /matches even though a roadmap genuinely exists.
  async function navigateToCareerPage(basePath: string) {
    if (careerId) {
      router.push(`${basePath}?career=${careerId}`);
      return;
    }

    try {
      const data = await apiGet<{ has_roadmap: boolean; career_id?: number }>(
        "/dashboard/summary"
      );

      if (data.has_roadmap && data.career_id) {
        setCareerId(data.career_id);
        router.push(`${basePath}?career=${data.career_id}`);
        return;
      }
    } catch {
      // fall through to /matches below
    }

    router.push("/matches");
  }

  const firstInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#f8faff] text-brand-ink">
      {/* ===============================================================
          TOP HEADER — persistent across every page in this group
      =============================================================== */}
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileNavOpen((open) => !open)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-50 lg:hidden"
            >
              {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <button
              type="button"
              onClick={() => router.push("/")}
              className="flex items-center gap-2.5 cursor-pointer"
            >
              <Image src="/logo-icon.png" alt="AI Career Navigator" width={34} height={34} priority />
              <span className="text-base font-bold text-brand-navy">
                AI <span className="text-brand-accent">Career Navigator</span>
              </span>
            </button>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="flex items-center gap-3"
            >
              <div className="hidden text-right sm:block">
                <p className="text-xs font-semibold text-brand-navy">{userName}</p>
                <p className="text-[10px] text-slate-400">Career Explorer</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-navy text-xs font-bold text-white">
                {firstInitial}
              </div>
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-2 shadow-xl">
                <div className="border-b border-slate-100 px-4 py-2.5">
                  <p className="truncate text-xs font-semibold text-brand-navy">{userName}</p>
                  <p className="truncate text-[10px] text-slate-400">{userEmail}</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    router.push("/profile/edit");
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  <Settings size={14} />
                  Edit profile
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-xs font-semibold text-red-600 transition hover:bg-red-50"
                >
                  <LogOut size={14} />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* =============================================================
          MOBILE NAV PANEL — same links as the desktop sidebar,
          shown as a slide-down panel below the lg breakpoint where
          the sidebar itself is hidden.
      ============================================================= */}
      {mobileNavOpen && (
        <div className="border-b border-slate-100 bg-white px-4 py-3 lg:hidden">
          <nav className="space-y-1">
            <SidebarItem
              icon={<LayoutDashboard size={17} />}
              label="Dashboard"
              onClick={() => {
                setMobileNavOpen(false);
                router.push("/dashboard");
              }}
            />
            <SidebarItem
              icon={<BrainCircuit size={17} />}
              label="Assessment"
              onClick={() => {
                setMobileNavOpen(false);
                router.push("/assessment");
              }}
            />
            <SidebarItem
              icon={<BriefcaseBusiness size={17} />}
              label="Career Matches"
              onClick={() => {
                setMobileNavOpen(false);
                router.push("/matches");
              }}
            />
            <SidebarItem
              icon={<BarChart3 size={17} />}
              label="Gap Analysis"
              onClick={() => {
                setMobileNavOpen(false);
                navigateToCareerPage("/gap");
              }}
            />
            <SidebarItem
              icon={<Route size={17} />}
              label="Roadmap"
              onClick={() => {
                setMobileNavOpen(false);
                navigateToCareerPage("/roadmap");
              }}
            />
            <SidebarItem
              icon={<MessageCircle size={17} />}
              label="AI Chat"
              onClick={() => {
                setMobileNavOpen(false);
                router.push("/chat");
              }}
            />
            <SidebarItem
              icon={<Settings size={17} />}
              label="Edit Profile"
              onClick={() => {
                setMobileNavOpen(false);
                router.push("/profile/edit");
              }}
            />
          </nav>
        </div>
      )}

      <div className="mx-auto flex max-w-[1500px]">
        {/* =============================================================
            SIDEBAR — persistent across every page in this group,
            visible on desktop only (lg and up)
        ============================================================= */}
        <aside className="sticky top-20 hidden h-[calc(100vh-5rem)] w-[240px] shrink-0 border-r border-slate-100 bg-white px-4 py-6 lg:block">
          <p className="mb-3 px-3 text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
            Your journey
          </p>

          <nav className="space-y-1">
            <SidebarItem
              icon={<LayoutDashboard size={17} />}
              label="Dashboard"
              onClick={() => router.push("/dashboard")}
            />
            <SidebarItem
              icon={<BrainCircuit size={17} />}
              label="Assessment"
              onClick={() => router.push("/assessment")}
            />
            <SidebarItem
              icon={<BriefcaseBusiness size={17} />}
              label="Career Matches"
              onClick={() => router.push("/matches")}
            />
            <SidebarItem
              icon={<BarChart3 size={17} />}
              label="Gap Analysis"
              onClick={() => navigateToCareerPage("/gap")}
            />
            <SidebarItem
              icon={<Route size={17} />}
              label="Roadmap"
              onClick={() => navigateToCareerPage("/roadmap")}
            />
            <SidebarItem
              icon={<MessageCircle size={17} />}
              label="AI Chat"
              onClick={() => router.push("/chat")}
            />
            <SidebarItem
              icon={<Settings size={17} />}
              label="Edit Profile"
              onClick={() => router.push("/profile/edit")}
            />
          </nav>

          <div className="absolute bottom-6 left-4 right-4 overflow-hidden rounded-2xl bg-brand-navy p-4 text-white">
            <Compass size={85} strokeWidth={0.6} className="absolute -right-5 -top-5 text-white/10" />
            <div className="relative">
              <p className="text-[9px] font-bold uppercase tracking-wider text-blue-200">
                Your journey
              </p>
              <p className="mt-1 text-sm font-bold">Keep going!</p>
            </div>
          </div>
        </aside>

        {/* =============================================================
            PAGE CONTENT — swaps based on which page is active
        ============================================================= */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

function SidebarItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-slate-500 transition-all hover:bg-slate-50 hover:text-brand-navy"
    >
      <span className="text-slate-400">{icon}</span>
      {label}
    </button>
  );
}