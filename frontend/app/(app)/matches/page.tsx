"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  Compass,
  Database,
  Route,
  Sparkles,
  Star,
  Target,
} from "lucide-react";

import { apiGet } from "@/lib/api/client";

/**
 * =====================================================================
 * AI CAREER NAVIGATOR — CAREER MATCHES
 * =====================================================================
 *
 * FILE:
 * frontend/app/matches/page.tsx
 *
 * ---------------------------------------------------------------------
 * WHAT'S REAL VS. WHAT WAS PLACEHOLDER
 * ---------------------------------------------------------------------
 * - Career list + compatibility scores now come live from
 *   GET /careers/match — no more hardcoded array. Scores are
 *   computed entirely by backend logic (never AI), matching the
 *   BRD's core design principle.
 * - matchingSkills / missingSkills (which didn't exist in the real
 *   API) are removed from the list view — that level of detail is
 *   what the GAP ANALYSIS page is for, not this matches list.
 * - Career icons are now chosen by matching keywords in the career
 *   title, since the real API has no "icon" field to invent data for.
 * - "View skill gaps" now navigates to /gap?career={id}, passing
 *   the REAL selected career's id through the URL so the gap page
 *   knows which career to analyze.
 * =====================================================================
 */

type CareerMatch = {
  career_id: number;
  title: string;
  description: string;
  industry: string;
  compatibility_score: number;
};

export default function CareerMatchesPage() {
  const router = useRouter();

  const [matches, setMatches] = useState<CareerMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedCareerId, setSelectedCareerId] = useState<number | null>(null);

  /**
   * -------------------------------------------------------------------
   * LOAD REAL MATCHES FROM THE BACKEND
   * -------------------------------------------------------------------
   */
  useEffect(() => {
    setLoading(true);
    setLoadError(null);

    apiGet<{ matches: CareerMatch[] }>("/careers/match")
      .then((data) => {
        setMatches(data.matches);
        // Select the top match by default, matching the original
        // design's "first career selected on load" behavior.
        if (data.matches.length > 0) {
          setSelectedCareerId(data.matches[0].career_id);
        }
        setLoading(false);
      })
      .catch((err) => {
        setLoadError(
          err instanceof Error ? err.message : "Failed to load career matches."
        );
        setLoading(false);
      });
  }, []);

  const selectedCareer =
    matches.find((career) => career.career_id === selectedCareerId) ?? matches[0];

  /**
   * -------------------------------------------------------------------
   * OPEN GAP ANALYSIS
   * -------------------------------------------------------------------
   * Passes the REAL selected career's id through the URL, so the
   * gap page (built next) knows which career to fetch a breakdown
   * for, instead of a hardcoded "AI Engineer".
   */
  function openGapAnalysis() {
    if (!selectedCareer) return;
    router.push(`/gap?career=${selectedCareer.career_id}`);
  }

  // ---------------------------------------------------------------
  // LOADING / ERROR STATES
  // ---------------------------------------------------------------
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8faff]">
        <p className="text-sm text-slate-500">Loading your career matches...</p>
      </div>
    );
  }

  if (loadError || matches.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8faff] px-6 text-center">
        <div>
          <p className="text-sm font-semibold text-red-600">
            {loadError || "No career matches available yet."}
          </p>
          <button
            onClick={() => router.push("/onboarding")}
            className="mt-4 text-sm font-semibold text-brand-accent"
          >
            Back to profile
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
        <div className="pointer-events-none absolute -left-52 top-[520px] h-[450px] w-[450px] rounded-full bg-indigo-100/40 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.025] [background-image:linear-gradient(to_right,#1e3a8a_1px,transparent_1px),linear-gradient(to_bottom,#1e3a8a_1px,transparent_1px)] [background-size:40px_40px]" />

        <div className="relative mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
          {/* ===========================================================
              PAGE INTRO
          =========================================================== */}
          <div className="mb-9 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-accent shadow-sm">
                <Sparkles size={13} />
                Your possibilities
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
                Your career matches
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Ranked by how closely your assessed skills align with each
                career&apos;s requirements.
              </p>
            </div>

            <div className="flex w-fit items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white">
                <Check size={15} strokeWidth={3} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  Assessment complete
                </p>
                <p className="text-xs font-semibold text-emerald-900">
                  Your matches are ready
                </p>
              </div>
            </div>
          </div>

          {/* ===========================================================
              JOURNEY INDICATOR
          =========================================================== */}
          <div className="mb-9 rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-7">
            <div className="relative grid grid-cols-4">
              <div className="absolute left-[12%] right-[12%] top-5 h-0.5 bg-slate-100" />
              <div className="absolute left-[12%] top-5 h-0.5 w-[51%] bg-brand-accent" />

              <JourneyStep icon={<Check size={14} />} label="Profile" completed />
              <JourneyStep icon={<Check size={14} />} label="Assessment" completed />
              <JourneyStep icon={<Compass size={14} />} label="Matches" active />
              <JourneyStep icon={<Route size={14} />} label="Roadmap" />
            </div>
          </div>

          {/* ===========================================================
              MAIN GRID
          =========================================================== */}
          <div className="grid items-start gap-8 lg:grid-cols-[1fr_340px]">
            {/* =========================================================
                CAREER RESULTS
            ========================================================= */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-brand-navy">
                    Recommended careers
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Select a career to explore why it matches.
                  </p>
                </div>

                <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-accent">
                  {matches.length} matches
                </span>
              </div>

              <div className="space-y-4">
                {matches.map((career, index) => (
                  <CareerMatchCard
                    key={career.career_id}
                    career={career}
                    rank={index + 1}
                    selected={selectedCareerId === career.career_id}
                    onSelect={() => setSelectedCareerId(career.career_id)}
                  />
                ))}
              </div>
            </section>

            {/* =========================================================
                RIGHT PANEL
            ========================================================= */}
            <aside className="space-y-5 lg:sticky lg:top-28">
              {/* =======================================================
                  SELECTED CAREER
              ======================================================= */}
              {selectedCareer && (
                <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-xl shadow-slate-900/[0.04]">
                  <div className="relative overflow-hidden bg-gradient-to-br from-brand-navy via-[#173c73] to-brand-accent p-6 text-white">
                    <Compass size={150} strokeWidth={0.6} className="absolute -right-10 -top-10 text-white/10" />

                    <div className="relative z-10">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
                        {getCareerIcon(selectedCareer.title)}
                      </div>

                      <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.15em] text-blue-200">
                        Selected career
                      </p>

                      <h2 className="mt-1 text-xl font-bold">{selectedCareer.title}</h2>

                      <div className="mt-5 flex items-end gap-2">
                        <span className="text-4xl font-bold">
                          {selectedCareer.compatibility_score}%
                        </span>
                        <span className="pb-1 text-xs text-blue-200">compatibility</span>
                      </div>

                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-blue-300"
                          style={{ width: `${selectedCareer.compatibility_score}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    {/* Description takes the place of the fabricated
                        matchingSkills/missingSkills lists, since
                        that per-skill detail is what the gap
                        analysis page is specifically for. */}
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      About this career
                    </p>
                    <p className="mt-2 text-xs leading-5 text-slate-600">
                      {selectedCareer.description}
                    </p>

                    <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Industry
                    </p>
                    <span className="mt-2 inline-block rounded-lg bg-blue-50 px-2.5 py-1.5 text-[10px] font-semibold text-brand-accent">
                      {selectedCareer.industry}
                    </span>

                    <button
                      type="button"
                      onClick={openGapAnalysis}
                      className="group mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-accent px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/15 transition-all hover:-translate-y-0.5 hover:bg-brand-navy"
                    >
                      View skill gaps
                      <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              )}

              {/* =======================================================
                  HOW SCORES WORK
              ======================================================= */}
              <div className="rounded-[1.5rem] border border-blue-100 bg-blue-50/60 p-5">
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-brand-accent shadow-sm">
                    <BarChart3 size={17} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-brand-navy">
                      How are matches calculated?
                    </h3>
                    <p className="mt-1.5 text-xs leading-5 text-slate-500">
                      Your assessed skill levels are compared with the skills
                      and levels required by each career.
                    </p>
                  </div>
                </div>
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
 * CAREER MATCH CARD
 * =====================================================================
 */
function CareerMatchCard({
  career,
  rank,
  selected,
  onSelect,
}: {
  career: CareerMatch;
  rank: number;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`
        group relative w-full overflow-hidden rounded-[1.5rem] border bg-white p-5 text-left transition-all duration-300 sm:p-6
        ${
          selected
            ? "border-brand-accent shadow-xl shadow-blue-950/[0.07] ring-1 ring-brand-accent"
            : "border-slate-200 shadow-sm hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg"
        }
      `}
    >
      {rank === 1 && <div className="absolute left-0 top-0 h-full w-1 bg-emerald-500" />}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-50 text-xs font-bold text-slate-400">
            {rank}
          </div>

          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition ${
              selected ? "bg-brand-accent text-white" : "bg-blue-50 text-brand-accent group-hover:bg-blue-100"
            }`}
          >
            {getCareerIcon(career.title)}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-brand-navy">{career.title}</h3>

            {rank === 1 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-700">
                <Star size={9} fill="currentColor" />
                Best match
              </span>
            )}
          </div>

          <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-500">
            {career.description}
          </p>

          <span className="mt-3 inline-block rounded-md bg-slate-50 px-2 py-1 text-[9px] font-medium text-slate-500">
            {career.industry}
          </span>
        </div>

        <div className="flex min-w-[110px] items-center gap-3 sm:block sm:text-right">
          <div>
            <span className="text-2xl font-bold text-brand-accent">
              {career.compatibility_score}%
            </span>
            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              Match
            </p>
          </div>

          <ChevronRight
            size={18}
            className={`ml-auto transition-all sm:ml-auto sm:mt-3 ${
              selected ? "translate-x-1 text-brand-accent" : "text-slate-300 group-hover:translate-x-1 group-hover:text-brand-accent"
            }`}
          />
        </div>
      </div>

      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${rank === 1 ? "bg-emerald-500" : "bg-brand-accent"}`}
          style={{ width: `${career.compatibility_score}%` }}
        />
      </div>
    </button>
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
    <div className="relative z-10 flex flex-col items-center">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full border-4 border-white shadow-sm ${
          completed ? "bg-emerald-500 text-white" : active ? "bg-brand-accent text-white" : "bg-slate-100 text-slate-400"
        }`}
      >
        {icon}
      </div>
      <span
        className={`mt-2 text-[10px] font-semibold sm:text-xs ${
          completed ? "text-emerald-600" : active ? "text-brand-accent" : "text-slate-400"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

/**
 * =====================================================================
 * CAREER ICON — picked by matching keywords in the real career
 * title, since the real API has no "icon" field like the original
 * placeholder data invented.
 * =====================================================================
 */
function getCareerIcon(title: string) {
  const lower = title.toLowerCase();
  if (lower.includes("data") || lower.includes("analyst") || lower.includes("intelligence")) {
    return <BarChart3 size={20} />;
  }
  if (lower.includes("machine learning") || lower.includes("ai")) {
    return <BrainCircuit size={20} />;
  }
  if (lower.includes("backend")) {
    return <Database size={20} />;
  }
  return <BriefcaseBusiness size={20} />;
}