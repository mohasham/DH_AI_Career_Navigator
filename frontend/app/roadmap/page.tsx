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
  Plus,
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
 * PROGRESS TRACKING (Sprint 6 addition)
 * ---------------------------------------------------------------------
 * - Each step now has a real "Mark as complete" checkbox, calling
 *   POST /progress/update. Toggling it updates is_completed locally
 *   AND recalculates the roadmap's readiness_percentage using the
 *   backend's blended formula (70% assessed skill, 30% step
 *   completion).
 * - Each step also has a small "Log activity" form (type + optional
 *   description), calling POST /progress/activity. This lets a user
 *   record real work (project/video/article/exercise) toward that
 *   skill, contributing a fixed point value, CAPPED AT 80 total from
 *   self-reported activity alone — a real, quiz-based assessment
 *   (Sprint 3) is the ONLY way to reach a skill score above 80. This
 *   directly addresses the concern that a bare checkbox reaching
 *   100% would be meaningless: self-reported effort now has
 *   structure, a visible running score, and an honest ceiling below
 *   verified mastery.
 * - A "Refresh roadmap" button now calls POST /roadmap/recalculate,
 *   which removes any step for a skill the user has since mastered
 *   (e.g. after retaking a real assessment) and recalculates
 *   readiness. This is the fix for a known limitation: without it,
 *   a roadmap would show stale advice ("learn SQL") forever, even
 *   after the user proved they already know it. Recalculation is
 *   pure backend math — NO Groq/AI call happens here, so clicking
 *   this button costs nothing and is always safe to click, even
 *   repeatedly, even if nothing has actually changed.
 * =====================================================================
 */

type RoadmapStepData = {
  step_id: number;
  step_order: number;
  title: string;
  description: string;
  skill_name: string | null;
  resource_url: string | null;
  is_completed: boolean;
};

type RoadmapData = {
  roadmap_id: number;
  career_title: string;
  readiness_percentage: number;
  already_existed: boolean;
  steps: RoadmapStepData[];
};

type ActivityType = "project" | "video" | "article" | "exercise";

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  project: "Project",
  video: "Video course",
  article: "Article",
  exercise: "Practice exercise",
};

export default function RoadmapPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const careerId = searchParams.get("career");

  const [data, setData] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

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

  /**
   * -------------------------------------------------------------------
   * TOGGLE STEP COMPLETION
   * -------------------------------------------------------------------
   * Calls POST /progress/update and applies the recalculated
   * readiness_percentage returned by the backend immediately, so the
   * UI reflects real progress without a separate refetch.
   */
  async function toggleStepComplete(step: RoadmapStepData) {
    if (!data) return;
    const newState = !step.is_completed;

    try {
      const result = await apiPost<{
        step_id: number;
        is_completed: boolean;
        roadmap_id: number;
        completed_steps: number;
        total_steps: number;
        readiness_percentage: number;
      }>("/progress/update", {
        step_id: step.step_id,
        is_completed: newState,
      });

      setData((prev) =>
        prev
          ? {
              ...prev,
              readiness_percentage: result.readiness_percentage,
              steps: prev.steps.map((s) =>
                s.step_id === step.step_id ? { ...s, is_completed: newState } : s
              ),
            }
          : prev
      );
    } catch (err) {
      console.error("Failed to update step:", err);
    }
  }

  /**
   * -------------------------------------------------------------------
   * REFRESH ROADMAP
   * -------------------------------------------------------------------
   * Calls POST /roadmap/recalculate, which removes any steps for
   * skills the user has since mastered (e.g. after retaking an
   * assessment) and recalculates readiness — fixing the "stale
   * roadmap" issue where old advice sticks around after real
   * progress has been made. Pure backend math, no AI call — safe
   * to click anytime, even with no changes, at no extra cost.
   */
  const [refreshing, setRefreshing] = useState(false);

  async function refreshRoadmap() {
    if (!data) return;
    setRefreshing(true);
    try {
      const result = await apiPost<RoadmapData>("/roadmap/recalculate", {
        roadmap_id: data.roadmap_id,
      });
      setData(result);
    } catch (err) {
      console.error("Failed to refresh roadmap:", err);
    } finally {
      setRefreshing(false);
    }
  }

  function goBack() {
    router.push(`/gap?career=${careerId}`);
  }

  function openDashboard() {
    router.push("/dashboard");
  }

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

  const completedCount = data.steps.filter((s) => s.is_completed).length;
  const currentStep = data.steps.find((s) => !s.is_completed) || data.steps[0];
  const nextStep = data.steps.find(
    (s) => s.step_id !== currentStep?.step_id && !s.is_completed
  );

  return (
    <main className="min-h-screen bg-[#f8faff] text-brand-ink">
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
                last. Mark steps complete and log real activities to track
                your progress.
              </p>

              {data.already_existed && (
                <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-slate-400">
                  <Check size={12} className="text-emerald-500" />
                  Showing your existing roadmap for this career.
                </p>
              )}
            </div>

            <div className="flex flex-col items-end gap-2">
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

              {/* REFRESH ROADMAP — re-checks skills against the
                  roadmap's current steps, removing any that are now
                  mastered. Pure backend math, no AI call, always
                  safe/free to click. */}
              <button
                type="button"
                onClick={refreshRoadmap}
                disabled={refreshing}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 transition hover:border-blue-200 hover:text-brand-accent disabled:opacity-60"
              >
                {refreshing ? "Refreshing..." : "🔄 Refresh roadmap"}
              </button>
            </div>
          </div>

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

          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <SummaryCard icon={<Target size={19} />} title="Overall readiness" value={`${data.readiness_percentage}%`}>
              <p className="mt-2 text-[10px] text-slate-400">
                Based on your assessed skills + progress
              </p>
            </SummaryCard>

            <SummaryCard icon={<CheckCircle2 size={19} />} title="Progress" value={`${completedCount}/${data.steps.length}`}>
              <p className="mt-2 text-[10px] text-slate-400">
                Roadmap steps completed
              </p>
            </SummaryCard>

            <SummaryCard icon={<BookOpen size={19} />} title="Current focus" value={currentStep?.skill_name ?? "—"} compact>
              <p className="mt-2 text-[10px] text-slate-400">
                {completedCount === data.steps.length ? "All steps done!" : "In progress"}
              </p>
            </SummaryCard>
          </div>

          <div className="grid items-start gap-8 lg:grid-cols-[1fr_340px]">
            <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-xl shadow-slate-900/[0.04]">
              <div className="border-b border-slate-100 px-6 py-6 sm:px-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-brand-navy">
                      Your learning route
                    </h2>
                    <p className="mt-1 text-xs text-slate-400">
                      Mark steps complete and log activities as you go.
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
                    key={step.step_id}
                    step={step}
                    isCurrent={step.step_id === currentStep?.step_id}
                    isLast={index === data.steps.length - 1}
                    onToggleComplete={() => toggleStepComplete(step)}
                  />
                ))}
              </div>
            </section>

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
                    {currentStep?.title ?? "All done!"}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-blue-100/75">
                    {completedCount === data.steps.length
                      ? `You've completed every step toward becoming a ${data.career_title}.`
                      : `Complete this step to keep moving toward your goal of becoming a ${data.career_title}.`}
                  </p>

                  <div className="mt-7 rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-200">
                        Progress
                      </span>
                      <span className="text-xs font-bold">
                        {completedCount} of {data.steps.length}
                      </span>
                    </div>

                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                        style={{ width: `${(completedCount / data.steps.length) * 100}%` }}
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
 * ROADMAP STEP CARD — now includes a real "Mark as complete"
 * checkbox and an activity-logging form.
 * =====================================================================
 */
function RoadmapStepCard({
  step,
  isCurrent,
  isLast,
  onToggleComplete,
}: {
  step: RoadmapStepData;
  isCurrent: boolean;
  isLast: boolean;
  onToggleComplete: () => void;
}) {
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [activityType, setActivityType] = useState<ActivityType>("project");
  const [activityDescription, setActivityDescription] = useState("");
  const [logging, setLogging] = useState(false);
  const [skillScore, setSkillScore] = useState<{
    practiced_points_total: number;
    real_assessment_score: number;
    final_skill_score: number;
    score_source: string;
  } | null>(null);

  async function handleLogActivity() {
    setLogging(true);
    try {
      const result = await apiPost<{
        practiced_points_total: number;
        real_assessment_score: number;
        final_skill_score: number;
        score_source: string;
      }>("/progress/activity", {
        step_id: step.step_id,
        activity_type: activityType,
        description: activityDescription || null,
      });
      setSkillScore(result);
      setActivityDescription("");
      setShowActivityForm(false);
    } catch (err) {
      console.error("Failed to log activity:", err);
    } finally {
      setLogging(false);
    }
  }

  return (
    <div className="relative flex gap-4 sm:gap-5">
      <div className="flex w-10 shrink-0 flex-col items-center">
        <button
          type="button"
          onClick={onToggleComplete}
          className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white shadow-sm transition ${
            step.is_completed
              ? "bg-emerald-500 text-white"
              : isCurrent
              ? "bg-brand-accent text-white ring-4 ring-blue-100"
              : "bg-blue-50 text-brand-accent hover:bg-blue-100"
          }`}
          title={step.is_completed ? "Mark as incomplete" : "Mark as complete"}
        >
          {step.is_completed ? (
            <Check size={15} strokeWidth={3} />
          ) : isCurrent ? (
            <MapPin size={15} />
          ) : (
            <Circle size={12} />
          )}
        </button>

        {!isLast && (
          <div
            className={`min-h-[110px] w-0.5 flex-1 ${
              step.is_completed ? "bg-emerald-200" : "bg-slate-100"
            }`}
          />
        )}
      </div>

      <div
        className={`mb-5 min-w-0 flex-1 rounded-2xl border p-5 transition-all sm:p-6 ${
          step.is_completed
            ? "border-emerald-100 bg-emerald-50/30"
            : isCurrent
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

              {step.is_completed && <StatusBadge text="Completed" color="emerald" />}
              {!step.is_completed && isCurrent && <StatusBadge text="In progress" color="blue" />}
            </div>

            <h3 className="mt-2 text-base font-bold text-brand-navy">{step.title}</h3>

            {step.skill_name && (
              <p className="mt-1 text-xs font-semibold text-brand-accent">
                {step.skill_name}
              </p>
            )}
          </div>

          <label className="flex w-fit cursor-pointer items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-[10px] font-semibold text-slate-500">
            <input
              type="checkbox"
              checked={step.is_completed}
              onChange={onToggleComplete}
              className="h-3.5 w-3.5 accent-brand-accent"
            />
            {step.is_completed ? "Completed" : "Mark complete"}
          </label>
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

        {/* =====================================================
            ACTIVITY LOGGING — records real self-reported work
            toward this skill. Capped at 80 total; only a real
            assessment can push the score above that.
        ===================================================== */}
        <div className="mt-4 border-t border-slate-100 pt-4">
          {!showActivityForm ? (
            <button
              type="button"
              onClick={() => setShowActivityForm(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-brand-accent"
            >
              <Plus size={13} />
              Log what you did for this skill
            </button>
          ) : (
            <div className="space-y-2.5 rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(ACTIVITY_LABELS) as ActivityType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setActivityType(type)}
                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition ${
                      activityType === type
                        ? "bg-brand-accent text-white"
                        : "bg-white text-slate-500 hover:bg-blue-50"
                    }`}
                  >
                    {ACTIVITY_LABELS[type]}
                  </button>
                ))}
              </div>

              <textarea
                value={activityDescription}
                onChange={(e) => setActivityDescription(e.target.value)}
                placeholder="Briefly describe what you did (optional)"
                rows={2}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-brand-navy outline-none focus:border-brand-accent"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleLogActivity}
                  disabled={logging}
                  className="rounded-lg bg-brand-accent px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-navy disabled:opacity-60"
                >
                  {logging ? "Logging..." : "Log activity"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowActivityForm(false)}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {skillScore && (
            <div className="mt-3 rounded-xl bg-blue-50/60 p-3 text-[11px] leading-5 text-slate-600">
              <span className="font-semibold text-brand-navy">
                {step.skill_name} score: {skillScore.final_skill_score}%
              </span>{" "}
              ({skillScore.score_source === "tested" ? "verified by assessment" : "from logged activity"})
              {skillScore.score_source === "practiced" && (
                <span className="mt-1 block text-slate-400">
                  Self-reported activity caps at 80% — take the real assessment to reach 100%.
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ text, color }: { text: string; color: "emerald" | "blue" }) {
  const styles =
    color === "emerald" ? "bg-emerald-50 text-emerald-700" : "bg-blue-100 text-brand-accent";
  return (
    <span className={`rounded-full px-2 py-1 text-[8px] font-bold uppercase tracking-wider ${styles}`}>
      {text}
    </span>
  );
}

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