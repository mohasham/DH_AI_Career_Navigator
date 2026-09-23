"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  CheckCircle2,
  CircleAlert,
  Compass,
  Route,
  Target,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";

import { apiGet } from "@/lib/api/client";

/**
 * =====================================================================
 * AI CAREER NAVIGATOR — SKILL GAP ANALYSIS
 * =====================================================================
 *
 * FILE:
 * frontend/app/gap/page.tsx
 *
 * ---------------------------------------------------------------------
 * WHAT'S REAL VS. WHAT WAS PLACEHOLDER
 * ---------------------------------------------------------------------
 * - Which career to analyze now comes from a REAL query param
 *   (?career={id}) passed from the matches page's "View skill gaps"
 *   button — no more hardcoded "AI Engineer".
 * - Skill gap data now comes live from GET /careers/{id}/gap — no
 *   more hardcoded array.
 * - SCALE CHANGE: the real backend uses a 0-100 scale
 *   (current_level: 44, required_level: 80), not the original
 *   design's 1-5 scale. All bars/dots below are adjusted to work
 *   directly with 0-100 — actually simpler than the original's
 *   1-5-to-percentage conversion, since the real values ARE already
 *   percentages.
 * - "Importance" is now the real 1-3 integer from career_skills,
 *   mapped to High/Medium/Low labels for display.
 * =====================================================================
 */

type SkillGapItem = {
  skill_name: string;
  current_level: number;
  required_level: number;
  gap: number;
  importance: number;
};

type GapResponse = {
  career_title: string;
  skill_gaps: SkillGapItem[];
};

function importanceLabel(importance: number): "High" | "Medium" | "Low" {
  if (importance >= 3) return "High";
  if (importance === 2) return "Medium";
  return "Low";
}

export default function SkillGapPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const careerId = searchParams.get("career");

  const [data, setData] = useState<GapResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  /**
   * -------------------------------------------------------------------
   * LOAD REAL GAP DATA FROM THE BACKEND
   * -------------------------------------------------------------------
   */
  useEffect(() => {
    if (!careerId) {
      setLoadError("No career selected. Please choose a career from your matches first.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError(null);

    apiGet<GapResponse>(`/careers/${careerId}/gap`)
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        setLoadError(
          err instanceof Error ? err.message : "Failed to load skill gap analysis."
        );
        setLoading(false);
      });
  }, [careerId]);

  const matchedSkills = data?.skill_gaps.filter((s) => s.gap === 0) ?? [];
  const missingSkills = data?.skill_gaps.filter((s) => s.gap > 0) ?? [];
  const priorityGaps = missingSkills.filter((s) => importanceLabel(s.importance) === "High");

  function goBack() {
    router.push("/matches");
  }

  function buildRoadmap() {
    router.push("/roadmap?career=${careerId}");
  }

  // ---------------------------------------------------------------
  // LOADING / ERROR STATES
  // ---------------------------------------------------------------
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8faff]">
        <p className="text-sm text-slate-500">Loading skill gap analysis...</p>
      </div>
    );
  }

  if (loadError || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8faff] px-6 text-center">
        <div>
          <p className="text-sm font-semibold text-red-600">
            {loadError || "Could not load skill gap analysis."}
          </p>
          <button
            onClick={goBack}
            className="mt-4 text-sm font-semibold text-brand-accent"
          >
            Back to career matches
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-w-0 flex-1 overflow-hidden">
      {/* ===============================================================
          HEADER
      =============================================================== */}
{/* ===============================================================
          BACKGROUND
      =============================================================== */}
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-48 -top-40 h-[500px] w-[500px] rounded-full bg-blue-100/60 blur-3xl" />
        <div className="pointer-events-none absolute -left-52 top-[550px] h-[450px] w-[450px] rounded-full bg-indigo-100/40 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.025] [background-image:linear-gradient(to_right,#1e3a8a_1px,transparent_1px),linear-gradient(to_bottom,#1e3a8a_1px,transparent_1px)] [background-size:40px_40px]" />

        <div className="relative mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
          {/* ===========================================================
              BACK LINK
          =========================================================== */}
          <button
            type="button"
            onClick={goBack}
            className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-brand-accent"
          >
            <ArrowLeft size={15} />
            Back to career matches
          </button>

          {/* ===========================================================
              PAGE INTRO
          =========================================================== */}
          <div className="mb-9 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-accent shadow-sm">
                <Target size={13} />
                Your path to {data.career_title}
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
                Skill Gap Analysis
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                See where your current abilities already meet the
                requirements and which skills you should strengthen to
                move closer to your career goal.
              </p>
            </div>

            <div className="flex w-fit items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-brand-accent">
                <Target size={19} />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Selected career
                </p>
                <p className="mt-0.5 text-sm font-bold text-brand-navy">
                  {data.career_title}
                </p>
              </div>
            </div>
          </div>

          {/* ===========================================================
              JOURNEY INDICATOR
          =========================================================== */}
          <div className="mb-9 rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-7">
            <div className="relative grid grid-cols-5">
              <div className="absolute left-[10%] right-[10%] top-5 h-0.5 bg-slate-100" />
              <div className="absolute left-[10%] top-5 h-0.5 w-[60%] bg-brand-accent" />

              <JourneyStep icon={<Check size={13} />} label="Profile" completed />
              <JourneyStep icon={<Check size={13} />} label="Assessment" completed />
              <JourneyStep icon={<Check size={13} />} label="Matches" completed />
              <JourneyStep icon={<BarChart3 size={13} />} label="Gap Analysis" active />
              <JourneyStep icon={<Route size={13} />} label="Roadmap" />
            </div>
          </div>

          {/* ===========================================================
              SUMMARY CARDS
          =========================================================== */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <SummaryCard
              icon={<BarChart3 size={19} />}
              value={data.skill_gaps.length.toString()}
              label="Skills compared"
              description="Across this career"
            />
            <SummaryCard
              icon={<CheckCircle2 size={19} />}
              value={matchedSkills.length.toString()}
              label="Requirements met"
              description="Already at target level"
              green
            />
            <SummaryCard
              icon={<TrendingUp size={19} />}
              value={missingSkills.length.toString()}
              label="Skills to strengthen"
              description={`${priorityGaps.length} high priority`}
              amber
            />
          </div>

          {/* ===========================================================
              MAIN GRID
          =========================================================== */}
          <div className="grid items-start gap-8 lg:grid-cols-[1fr_340px]">
            {/* =========================================================
                LEFT — SKILL COMPARISON
            ========================================================= */}
            <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-xl shadow-slate-900/[0.04]">
              <div className="border-b border-slate-100 px-6 py-6 sm:px-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-brand-navy">
                      Your skills vs. career requirements
                    </h2>
                    <p className="mt-1 text-xs text-slate-400">
                      Compare your assessed level with the level required for{" "}
                      {data.career_title}.
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-[10px] font-semibold text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-brand-accent" />
                      Your level
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-slate-300" />
                      Required
                    </div>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {data.skill_gaps.map((skill) => (
                  <SkillComparison key={skill.skill_name} skill={skill} />
                ))}
              </div>
            </section>

            {/* =========================================================
                RIGHT SIDEBAR
            ========================================================= */}
            <aside className="space-y-5 lg:sticky lg:top-28">
              <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-brand-navy via-[#173c73] to-brand-accent p-6 text-white shadow-xl shadow-blue-950/15">
                <Compass size={170} strokeWidth={0.6} className="absolute -right-12 -top-12 text-white/10" />

                <svg
                  viewBox="0 0 300 220"
                  fill="none"
                  className="pointer-events-none absolute bottom-0 left-0 h-48 w-full opacity-40"
                >
                  <path
                    d="M-10 210 C45 155 75 185 110 135 C145 85 175 145 215 90 C250 40 275 70 320 10"
                    stroke="#93C5FD"
                    strokeWidth="2"
                    strokeDasharray="6 7"
                  />
                  <circle cx="110" cy="135" r="6" fill="#ffffff" />
                  <circle cx="280" cy="55" r="8" fill="#34D399" />
                </svg>

                <div className="relative z-10">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
                    <Route size={21} />
                  </div>

                  <p className="mt-6 text-xs font-semibold uppercase tracking-[0.15em] text-blue-200">
                    Your next move
                  </p>

                  <h3 className="mt-2 text-xl font-bold">
                    You don&apos;t need to learn everything.
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-blue-100/75">
                    Focus on the gaps between what you already know and
                    what {data.career_title} actually requires.
                  </p>

                  <div className="mt-7 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur">
                      <p className="text-2xl font-bold">{matchedSkills.length}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-wider text-blue-200">
                        Ready
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur">
                      <p className="text-2xl font-bold">{missingSkills.length}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-wider text-blue-200">
                        Gaps
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {priorityGaps.length > 0 && (
                <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-900/[0.03]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                      <TriangleAlert size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                        Priority gaps
                      </p>
                      <h3 className="text-sm font-bold text-brand-navy">Focus here first</h3>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {priorityGaps.map((skill, index) => (
                      <div key={skill.skill_name} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-[10px] font-bold text-brand-accent shadow-sm">
                          {index + 1}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-brand-navy">
                            {skill.skill_name}
                          </p>
                          <p className="mt-0.5 text-[10px] text-slate-400">
                            {skill.current_level}% → {skill.required_level}%
                          </p>
                        </div>

                        <TrendingUp size={14} className="text-amber-500" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-[1.5rem] border border-blue-100 bg-blue-50/60 p-5">
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-brand-accent shadow-sm">
                    <BookOpen size={17} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-brand-navy">
                      Ready to close the gaps?
                    </h3>
                    <p className="mt-1.5 text-xs leading-5 text-slate-500">
                      Turn these gaps into an ordered, personalized
                      learning path.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={buildRoadmap}
                  className="group mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-accent px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/15 transition-all hover:-translate-y-0.5 hover:bg-brand-navy"
                >
                  Build my roadmap
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * =====================================================================
 * SKILL COMPARISON — adjusted to work directly with the real 0-100
 * scale (no 1-5 conversion needed, since the backend already
 * returns percentages).
 * =====================================================================
 */
function SkillComparison({ skill }: { skill: SkillGapItem }) {
  const isMatched = skill.gap === 0;
  const importance = importanceLabel(skill.importance);

  return (
    <div className="px-6 py-6 transition hover:bg-slate-50/60 sm:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              isMatched ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
            }`}
          >
            {isMatched ? <CheckCircle2 size={18} /> : <TrendingUp size={18} />}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-brand-navy">{skill.skill_name}</h3>
              <ImportanceBadge importance={importance} />
            </div>
          </div>
        </div>

        <div
          className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${
            isMatched ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
          }`}
        >
          {isMatched ? (
            <>
              <Check size={11} />
              Requirement met
            </>
          ) : (
            <>
              <CircleAlert size={11} />
              Skill gap
            </>
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <LevelBar label="Your level" level={skill.current_level} user />
        <LevelBar label="Required level" level={skill.required_level} />
      </div>

      {!isMatched && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-50/70 px-3 py-2 text-[10px] font-medium text-amber-700">
          <TrendingUp size={12} />
          Improve by {skill.gap} points to meet this requirement.
        </div>
      )}
    </div>
  );
}

/**
 * =====================================================================
 * LEVEL BAR — works directly with 0-100 values now.
 * =====================================================================
 */
function LevelBar({
  label,
  level,
  user = false,
}: {
  label: string;
  level: number;
  user?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </span>
        <span className={`text-xs font-bold ${user ? "text-brand-accent" : "text-brand-navy"}`}>
          {level}%
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            user ? "bg-brand-accent" : "bg-slate-400"
          }`}
          style={{ width: `${level}%` }}
        />
      </div>
    </div>
  );
}

/**
 * =====================================================================
 * SUMMARY CARD
 * =====================================================================
 */
function SummaryCard({
  icon,
  value,
  label,
  description,
  green = false,
  amber = false,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  description: string;
  green?: boolean;
  amber?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
          green ? "bg-emerald-50 text-emerald-600" : amber ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-brand-accent"
        }`}
      >
        {icon}
      </div>

      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-brand-navy">{value}</span>
          <span className="text-xs font-semibold text-slate-600">{label}</span>
        </div>
        <p className="mt-0.5 text-[10px] text-slate-400">{description}</p>
      </div>
    </div>
  );
}

/**
 * =====================================================================
 * IMPORTANCE BADGE
 * =====================================================================
 */
function ImportanceBadge({ importance }: { importance: "High" | "Medium" | "Low" }) {
  const styles = {
    High: "bg-red-50 text-red-600",
    Medium: "bg-amber-50 text-amber-600",
    Low: "bg-slate-100 text-slate-500",
  };

  return (
    <span className={`rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider ${styles[importance]}`}>
      {importance} importance
    </span>
  );
}

/**
 * =====================================================================
 * JOURNEY STEP
 * =====================================================================
 */
function JourneyStep({
  icon,
  label,
  active = false,
  completed = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  completed?: boolean;
}) {
  return (
    <div className="relative z-10 flex flex-col items-center text-center">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full border-4 border-white shadow-sm ${
          completed ? "bg-emerald-500 text-white" : active ? "bg-brand-accent text-white" : "bg-slate-100 text-slate-400"
        }`}
      >
        {icon}
      </div>
      <span
        className={`mt-2 text-[9px] font-semibold sm:text-xs ${
          completed ? "text-emerald-600" : active ? "text-brand-accent" : "text-slate-400"
        }`}
      >
        {label}
      </span>
    </div>
  );
}