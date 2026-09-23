"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronRight,
  Flame,
  MessageCircle,
  Route,
  Sparkles,
  Target,
  Compass,
} from "lucide-react";

import { apiGet } from "@/lib/api/client";

/**
 * =====================================================================
 * AI CAREER NAVIGATOR — PROGRESS DASHBOARD (content only)
 * =====================================================================
 *
 * FILE:
 * frontend/app/(app)/dashboard/page.tsx
 *
 * NOTE: header, sidebar, and avatar dropdown (with logout + edit
 * profile) now live in the shared frontend/app/(app)/layout.tsx —
 * this file only contains the dashboard's own inner content. No
 * duplicate header/sidebar code here anymore.
 *
 * ---------------------------------------------------------------------
 * WHAT'S REAL VS. WHAT WAS PLACEHOLDER
 * ---------------------------------------------------------------------
 * - All dashboard numbers come from GET /dashboard/summary, which
 *   picks the user's MOST RECENTLY UPDATED roadmap as their "target
 *   career" (Option A) — any interaction with a roadmap counts as
 *   an update, keeping the dashboard focused on whatever the user
 *   was most recently working on.
 * - "Skills done / total skills" and "Est. remaining" from the
 *   original design were removed — nothing in the backend tracks a
 *   fixed skill catalog size or estimates time. Replaced with real,
 *   available metrics: steps completed/total and current step title.
 * - Empty state: if the user has no roadmap yet, shows a friendly
 *   prompt to explore career matches instead of a broken dashboard.
 * =====================================================================
 */

type DashboardOpportunity = {
  skill_name: string;
  current_level: number;
  required_level: number;
  gap: number;
};

type DashboardSummary = {
  has_roadmap: boolean;
  target_career: string | null;
  readiness_percentage: number;
  steps_completed: number;
  steps_total: number;
  opportunities: DashboardOpportunity[];
  current_step_title: string | null;
};

export default function DashboardPage() {
  const router = useRouter();

  const [userName, setUserName] = useState("there");
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<DashboardSummary>("/dashboard/summary")
      .then((data) => {
        setSummary(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-slate-500">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="relative min-w-0 flex-1 overflow-hidden">
      <div className="pointer-events-none absolute -right-52 -top-40 h-[500px] w-[500px] rounded-full bg-blue-100/60 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.025] [background-image:linear-gradient(to_right,#1e3a8a_1px,transparent_1px),linear-gradient(to_bottom,#1e3a8a_1px,transparent_1px)] [background-size:40px_40px]" />

      <div className="relative px-6 py-10 lg:px-10 lg:py-12">
        {/* ===========================================================
            EMPTY STATE — no roadmap yet
        =========================================================== */}
        {!summary?.has_roadmap ? (
          <div className="flex flex-col items-center justify-center rounded-[1.75rem] border border-slate-200 bg-white py-20 text-center shadow-sm">
            <Compass size={40} className="text-brand-accent" />
            <h2 className="mt-4 text-xl font-bold text-brand-navy">
              Your journey hasn&apos;t started yet
            </h2>
            <p className="mt-2 max-w-sm text-sm text-slate-500">
              Explore your career matches and build a personalized
              roadmap to see your progress here.
            </p>
            <button
              type="button"
              onClick={() => router.push("/matches")}
              className="group mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/15 transition-all hover:-translate-y-0.5 hover:bg-brand-navy"
            >
              Explore career matches
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        ) : (
          <>
            {/* =========================================================
                WELCOME
            ========================================================= */}
            <section className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-accent shadow-sm">
                  <Sparkles size={12} />
                  Your career journey
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
                  Welcome back
                </h1>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                  <Target size={15} className="text-brand-accent" />
                  <span>
                    Target:{" "}
                    <strong className="text-brand-navy">{summary.target_career}</strong>
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => router.push("/matches")}
                className="group inline-flex w-fit items-center gap-2 rounded-xl bg-brand-accent px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/15 transition-all hover:-translate-y-0.5 hover:bg-brand-navy"
              >
                View my roadmap
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </button>
            </section>

            {/* =========================================================
                KPI CARDS
            ========================================================= */}
            <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <MetricCard
                icon={<Target size={19} />}
                label="Readiness"
                value={`${summary.readiness_percentage}%`}
                accent="blue"
              >
                <p className="mt-2 text-[10px] text-slate-400">
                  Based on assessed skills + progress
                </p>
              </MetricCard>

              <MetricCard
                icon={<CheckCircle2 size={19} />}
                label="Steps done"
                value={`${summary.steps_completed}/${summary.steps_total}`}
                accent="green"
              >
                <p className="mt-2 text-[10px] text-slate-400">
                  On your current roadmap
                </p>
              </MetricCard>

              <MetricCard
                icon={<Route size={19} />}
                label="Current focus"
                value={summary.current_step_title ? "In progress" : "All done!"}
                accent="purple"
              >
                <p className="mt-2 line-clamp-2 text-[10px] leading-4 text-slate-400">
                  {summary.current_step_title || "Every step completed"}
                </p>
              </MetricCard>
            </section>

            {/* =========================================================
                MAIN DASHBOARD GRID
            ========================================================= */}
            <section className="grid items-start gap-6 xl:grid-cols-[1fr_0.9fr]">
              {/* BIGGEST OPPORTUNITIES */}
              <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-xl shadow-slate-900/[0.04]">
                <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                      <Flame size={17} />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-brand-navy">
                        Your biggest opportunities
                      </h2>
                      <p className="mt-0.5 text-[10px] text-slate-400">
                        Skills with the biggest impact on your goal
                      </p>
                    </div>
                  </div>
                </div>

                {summary.opportunities.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {summary.opportunities.map((opp, index) => (
                      <OpportunityRow key={opp.skill_name} opportunity={opp} rank={index + 1} />
                    ))}
                  </div>
                ) : (
                  <div className="px-6 py-10 text-center text-sm text-slate-400">
                    No gaps remaining — you&apos;re fully ready for this career!
                  </div>
                )}
              </div>

              {/* AI COACH */}
              <div className="relative overflow-hidden rounded-[1.75rem] border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
                <Bot size={130} strokeWidth={0.6} className="absolute -bottom-8 -right-5 text-brand-accent/[0.07]" />
                <div className="relative z-10">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-brand-accent shadow-sm">
                    <Bot size={20} />
                  </div>
                  <h2 className="mt-5 text-lg font-bold text-brand-navy">Need some direction?</h2>
                  <p className="mt-2 max-w-md text-xs leading-5 text-slate-500">
                    Ask about your skill gaps, roadmap, progress, or why a
                    particular career matches your profile.
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push("/chat")}
                    className="group mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-brand-accent shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <MessageCircle size={14} />
                    Ask the AI coach
                    <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * =====================================================================
 * METRIC CARD
 * =====================================================================
 */
function MetricCard({
  icon,
  label,
  value,
  accent,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: "blue" | "green" | "purple" | "amber";
  children: React.ReactNode;
}) {
  const styles = {
    blue: "bg-blue-50 text-brand-accent",
    green: "bg-emerald-50 text-emerald-600",
    purple: "bg-violet-50 text-violet-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-bold text-brand-navy">{value}</p>
          {children}
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${styles[accent]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

/**
 * =====================================================================
 * OPPORTUNITY ROW
 * =====================================================================
 */
function OpportunityRow({
  opportunity,
  rank,
}: {
  opportunity: DashboardOpportunity;
  rank: number;
}) {
  return (
    <div className="flex gap-4 px-6 py-5 transition hover:bg-slate-50/70">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-[10px] font-bold text-slate-400">
        {rank}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-bold text-brand-navy">{opportunity.skill_name}</h3>

        <div className="mt-3 flex items-center gap-2">
          <span className="text-[9px] font-semibold text-slate-400">Current</span>
          <span className="text-xs font-bold text-brand-accent">{opportunity.current_level}%</span>
          <ArrowRight size={11} className="text-slate-300" />
          <span className="text-[9px] font-semibold text-slate-400">Required</span>
          <span className="text-xs font-bold text-brand-navy">{opportunity.required_level}%</span>
        </div>
      </div>

      <ChevronRight size={16} className="mt-2 shrink-0 text-slate-300" />
    </div>
  );
}