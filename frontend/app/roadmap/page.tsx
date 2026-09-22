"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  Compass,
  Flag,
  MapPin,
  Route,
  Sparkles,
  Target,
} from "lucide-react";

import { apiPost } from "@/lib/api/client";

/**
 * =====================================================================
 * AI CAREER NAVIGATOR — PERSONALIZED ROADMAP
 * =====================================================================
 *
 * FILE:
 * frontend/app/roadmap/page.tsx
 *
 * ---------------------------------------------------------------------
 * WHAT'S REAL VS. WHAT WAS PLACEHOLDER
 * ---------------------------------------------------------------------
 * - The career comes from a REAL query param (?career={id}), passed
 *   from the gap analysis page's "Build my roadmap" button.
 * - On load, this page calls POST /roadmap/generate. If the user
 *   already has a roadmap for this career, the backend returns the
 *   EXISTING one (already_existed: true) instead of generating a
 *   new one — avoids duplicate Groq calls and duplicate database
 *   rows on repeat visits.
 * - Steps no longer have "duration" or "resourceProvider" fields
 *   like the original placeholder design — the real AI-generated
 *   steps use resource_url instead, populated from a curated,
 *   hand-picked lookup table in the backend (never AI-invented, to
 *   avoid hallucinated/fake links).
 * - Step status (completed/current/locked) doesn't exist in the
 *   real data yet — that's Sprint 6's job. For now: since every
 *   roadmap is freshly generated, no step starts "completed". The
 *   first step is shown as "current", the rest as "upcoming".
 * - readiness_percentage comes directly from the real backend
 *   response, computed by the same deterministic math as gap
 *   analysis, never by AI.
 * =====================================================================
 */

type RoadmapStepData = {
  step_order: number;
  title: string;
  description: string;
  skill_name: string | null;
  resource_url: string | null;
};

type RoadmapData = {
  roadmap_id: number;
  career_title: string;
  readiness_percentage: number;
  already_existed: boolean;
  steps: RoadmapStepData[];
};

export default function RoadmapPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const careerId = searchParams.get("career");

  const [data, setData] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  /**
   * -------------------------------------------------------------------
   * GENERATE THE REAL ROADMAP
   * -------------------------------------------------------------------
   * Calls POST /roadmap/generate on load — this triggers the full
   * chain: real gap data -> Groq -> validated steps -> saved to
   * Supabase -> returned here. Or, if one already exists for this
   * career, the backend returns that existing roadmap instead.
   */
  useEffect(() => {
    if (!careerId) {
      setLoadError("No career selected. Please choose a career from your matches first.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError(null);

    apiPost<RoadmapData>("/roadmap/generate", { career_id: Number(careerId) })
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        setLoadError(
          err instanceof Error ? err.message : "Failed to generate your roadmap."
        );
        setLoading(false);
      });
  }, [careerId]);

  function goBack() {
    router.push(`/gap?career=${careerId}`);
  }

  function openDashboard() {
    router.push("/dashboard");
  }

  // ---------------------------------------------------------------
  // LOADING / ERROR STATES
  // ---------------------------------------------------------------
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8faff] px-6 text-center">
        <div>
          <p className="text-sm text-slate-500">
            Generating your personalized roadmap...
          </p>
          <p className="mt-2 text-xs text-slate-400">
            This can take a few seconds while AI builds your steps.
          </p>
        </div>
      </main>
    );
  }

  if (loadError || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8faff] px-6 text-center">
        <div>
          <p className="text-sm font-semibold text-red-600">
            {loadError || "Could not generate your roadmap."}
          </p>
          <button
            onClick={() => router.push("/matches")}
            className="mt-4 text-sm font-semibold text-brand-accent"
          >
            Back to career matches
          </button>
        </div>
      </main>
    );
  }

  const currentStep = data.steps[0];
  const nextStep = data.steps[1];

  return (
    <main className="min-h-screen bg-[#f8faff] text-brand-ink">
      {/* ===============================================================
          HEADER
      =============================================================== */}
      <header className="border-b border-slate-100 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <Image src="/logo-icon.png" alt="AI Career Navigator" width={34} height={34} priority />
            <span className="text-base font-bold text-brand-navy">
              AI <span className="text-brand-accent">Career Navigator</span>
            </span>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3.5 py-2 text-xs font-semibold text-brand-accent sm:flex">
            <Route size={14} />
            Personalized Roadmap
          </div>
        </div>
      </header>

      {/* ===============================================================
          BACKGROUND
      =============================================================== */}
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-48 -top-40 h-[500px] w-[500px] rounded-full bg-blue-100/60 blur-3xl" />
        <div className="pointer-events-none absolute -left-52 top-[600px] h-[450px] w-[450px] rounded-full bg-indigo-100/40 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.025] [background-image:linear-gradient(to_right,#1e3a8a_1px,transparent_1px),linear-gradient(to_bottom,#1e3a8a_1px,transparent_1px)] [background-size:40px_40px]" />

        <div className="relative mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
          <button
            type="button"
            onClick={goBack}
            className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-brand-accent"
          >
            <ArrowLeft size={15} />
            Back to skill gaps
          </button>

          {/* ===========================================================
              PAGE INTRO
          =========================================================== */}
          <div className="mb-9 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-accent shadow-sm">
                <Sparkles size={13} />
                Your personalized path
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
                Your roadmap to{" "}
                <span className="text-brand-accent">{data.career_title}</span>
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Your learning path is ordered so each skill builds on the
                last. Skills you already have don&apos;t appear here.
              </p>

              {data.already_existed && (
                <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-slate-400">
                  <Check size={12} className="text-emerald-500" />
                  Showing your existing roadmap for this career.
                </p>
              )}
            </div>

            <div className="flex w-fit items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-brand-accent">
                <Target size={19} />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Overall readiness
                </p>
                <p className="mt-0.5 text-sm font-bold text-brand-navy">
                  {data.readiness_percentage}%
                </p>
              </div>

              <div className="ml-2 border-l border-slate-100 pl-4">
                <p className="text-xl font-bold text-brand-accent">
                  {data.steps.length}
                </p>
                <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                  Steps
                </p>
              </div>
            </div>
          </div>

          {/* ===========================================================
              JOURNEY PROGRESS
          =========================================================== */}
          <div className="mb-8 rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-7">
            <div className="relative grid grid-cols-5">
              <div className="absolute left-[10%] right-[10%] top-5 h-0.5 bg-slate-100" />
              <div className="absolute left-[10%] top-5 h-0.5 w-[80%] bg-brand-accent" />

              <JourneyStep icon={<Check size={13} />} label="Profile" completed />
              <JourneyStep icon={<Check size={13} />} label="Assessment" completed />
              <JourneyStep icon={<Check size={13} />} label="Matches" completed />
              <JourneyStep icon={<Check size={13} />} label="Gap Analysis" completed />
              <JourneyStep icon={<Route size={13} />} label="Roadmap" active />
            </div>
          </div>

          {/* ===========================================================
              SUMMARY CARDS
          =========================================================== */}
          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <SummaryCard icon={<Target size={19} />} title="Overall readiness" value={`${data.readiness_percentage}%`}>
              <p className="mt-2 text-[10px] text-slate-400">
                Based on your assessed skills
              </p>
            </SummaryCard>

            <SummaryCard icon={<CheckCircle2 size={19} />} title="Progress" value={`0/${data.steps.length}`}>
              <p className="mt-2 text-[10px] text-slate-400">
                Roadmap steps completed
              </p>
            </SummaryCard>

            <SummaryCard icon={<BookOpen size={19} />} title="Current focus" value={currentStep?.skill_name ?? "—"} compact>
              <p className="mt-2 text-[10px] text-slate-400">Step 1</p>
            </SummaryCard>
          </div>

          {/* ===========================================================
              MAIN GRID
          =========================================================== */}
          <div className="grid items-start gap-8 lg:grid-cols-[1fr_340px]">
            {/* =========================================================
                ROADMAP TIMELINE
            ========================================================= */}
            <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-xl shadow-slate-900/[0.04]">
              <div className="border-b border-slate-100 px-6 py-6 sm:px-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-brand-navy">
                      Your learning route
                    </h2>
                    <p className="mt-1 text-xs text-slate-400">
                      Follow the steps in order to close your highest-impact
                      skill gaps.
                    </p>
                  </div>

                  <div className="inline-flex w-fit items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-accent">
                    <Route size={12} />
                    {data.steps.length} steps
                  </div>
                </div>
              </div>

              <div className="px-6 py-3 sm:px-8">
                {data.steps.map((step, index) => (
                  <RoadmapStepCard
                    key={step.step_order}
                    step={step}
                    isFirst={index === 0}
                    isLast={index === data.steps.length - 1}
                  />
                ))}
              </div>
            </section>

            {/* =========================================================
                SIDEBAR
            ========================================================= */}
            <aside className="space-y-5 lg:sticky lg:top-28">
              <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-brand-navy via-[#173c73] to-brand-accent p-6 text-white shadow-xl shadow-blue-950/15">
                <Compass size={180} strokeWidth={0.6} className="absolute -right-12 -top-12 text-white/10" />

                <div className="relative z-10">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
                    <MapPin size={21} />
                  </div>

                  <p className="mt-6 text-xs font-semibold uppercase tracking-[0.15em] text-blue-200">
                    You are here
                  </p>

                  <h3 className="mt-2 text-xl font-bold">
                    {currentStep?.title ?? "Get started"}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-blue-100/75">
                    Complete this step to keep moving toward your goal of
                    becoming a {data.career_title}.
                  </p>

                  <div className="mt-7 rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-200">
                        Current step
                      </span>
                      <span className="text-xs font-bold">
                        1 of {data.steps.length}
                      </span>
                    </div>

                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-emerald-400"
                        style={{ width: `${100 / data.steps.length}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {nextStep && (
                <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-900/[0.03]">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-brand-accent">
                      <Flag size={18} />
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-brand-accent">
                        Up next
                      </p>
                      <h3 className="mt-1 text-sm font-bold text-brand-navy">
                        {nextStep.title}
                      </h3>
                    </div>
                  </div>

                  <p className="mt-4 text-xs leading-5 text-slate-500">
                    Finish{" "}
                    <strong className="text-brand-navy">{currentStep?.title}</strong>{" "}
                    to move on to {nextStep.title}.
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={openDashboard}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:text-brand-accent"
              >
                View progress dashboard
                <ArrowRight size={13} />
              </button>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}

/**
 * =====================================================================
 * ROADMAP STEP CARD — adapted to real fields only (no duration or
 * resourceProvider, since the real AI response doesn't include
 * them). resource_url now links to a curated, real learning
 * resource (populated by the backend's SKILL_RESOURCES lookup,
 * never AI-generated). Status is derived purely from position:
 * first step = "current", everything else = "upcoming", until
 * Sprint 6 adds real completion tracking.
 * =====================================================================
 */
function RoadmapStepCard({
  step,
  isFirst,
  isLast,
}: {
  step: RoadmapStepData;
  isFirst: boolean;
  isLast: boolean;
}) {
  const current = isFirst;

  return (
    <div className="relative flex gap-4 sm:gap-5">
      <div className="flex w-10 shrink-0 flex-col items-center">
        <div
          className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white shadow-sm ${
            current ? "bg-brand-accent text-white ring-4 ring-blue-100" : "bg-blue-50 text-brand-accent"
          }`}
        >
          {current ? <MapPin size={15} /> : <Circle size={12} />}
        </div>

        {!isLast && <div className="min-h-[110px] w-0.5 flex-1 bg-slate-100" />}
      </div>

      <div
        className={`mb-5 min-w-0 flex-1 rounded-2xl border p-5 transition-all sm:p-6 ${
          current
            ? "border-brand-accent bg-blue-50/40 shadow-lg shadow-blue-950/[0.05] ring-1 ring-brand-accent"
            : "border-slate-200 bg-white hover:border-blue-200 hover:shadow-md"
        }`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                Step {step.step_order}
              </span>

              {current && <StatusBadge text="In progress" />}
            </div>

            <h3 className="mt-2 text-base font-bold text-brand-navy">{step.title}</h3>

            {step.skill_name && (
              <p className="mt-1 text-xs font-semibold text-brand-accent">
                {step.skill_name}
              </p>
            )}
          </div>

          <div className="flex w-fit items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-[10px] font-semibold text-slate-500">
            <Clock3 size={12} />
            {current ? "In progress" : "Not started"}
          </div>
        </div>

        <p className="mt-4 max-w-2xl text-xs leading-5 text-slate-500">
          {step.description}
        </p>

        {step.resource_url && (
          <a
            href={step.resource_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-accent transition hover:text-brand-navy"
          >
            <BookOpen size={13} />
            View learning resource
            <ArrowRight size={12} />
          </a>
        )}
      </div>
    </div>
  );
}

/**
 * =====================================================================
 * STATUS BADGE
 * =====================================================================
 */
function StatusBadge({ text }: { text: string }) {
  return (
    <span className="rounded-full bg-blue-100 px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-brand-accent">
      {text}
    </span>
  );
}

/**
 * =====================================================================
 * SUMMARY CARD
 * =====================================================================
 */
function SummaryCard({
  icon,
  title,
  value,
  children,
  compact = false,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-brand-accent">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{title}</p>
        <p className={`mt-1 font-bold text-brand-navy ${compact ? "truncate text-base" : "text-2xl"}`}>
          {value}
        </p>
        {children}
      </div>
    </div>
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