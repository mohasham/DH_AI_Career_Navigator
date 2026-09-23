"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  BrainCircuit,
  BriefcaseBusiness,
  Compass,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Route,
  Settings,
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
 * =====================================================================
 */

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabase = createClient();

  const [userName, setUserName] = useState("there");
  const [userEmail, setUserEmail] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
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
useEffect(() => {
  apiGet("/profile").catch(() => {
    router.push("/onboarding");
  });
}, []);

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

  const firstInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#f8faff] text-brand-ink">
      {/* ===============================================================
          TOP HEADER — persistent across every page in this group
      =============================================================== */}
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <Image src="/logo-icon.png" alt="AI Career Navigator" width={34} height={34} priority />
            <span className="text-base font-bold text-brand-navy">
              AI <span className="text-brand-accent">Career Navigator</span>
            </span>
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

      <div className="mx-auto flex max-w-[1500px]">
        {/* =============================================================
            SIDEBAR — persistent across every page in this group
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
  onClick={() => router.push(careerId ? `/gap?career=${careerId}` : "/matches")}
/>
<SidebarItem
  icon={<Route size={17} />}
  label="Roadmap"
  onClick={() => router.push(careerId ? `/roadmap?career=${careerId}` : "/matches")}
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