"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";

import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  Check,
  CircleHelp,
  Code2,
  Compass,
  Lightbulb,
  Route,
  Sparkles,
  Target,
} from "lucide-react";

import { apiGet, apiPost } from "@/lib/api/client";

/**
 * =====================================================================
 * AI CAREER NAVIGATOR — SKILL ASSESSMENT
 * =====================================================================
 *
 * FILE:
 * frontend/app/assessment/[skill]/page.tsx
 *
 * Dynamic route — [skill] means this same file handles
 * /assessment/python, /assessment/sql, /assessment/javascript, etc.
 * The skill name comes from the URL itself, matched against
 * useParams(). No separate skill-selection screen exists per the
 * approved wireframe (Screen 3 shows the assessment already in
 * progress for one specific skill).
 *
 * ---------------------------------------------------------------------
 * WHAT'S REAL VS. WHAT WAS PLACEHOLDER
 * ---------------------------------------------------------------------
 * - Questions are now fetched live from
 *   GET /assessment/questions/{skill} on page load — no more
 *   hardcoded array. The backend returns options and difficulty
 *   but never the correct_answer, so cheating via dev tools isn't
 *   possible.
 * - Answers are now stored as { questionId: answerText }, matching
 *   exactly what POST /assessment/submit expects — not option
 *   indexes like the original placeholder version.
 * - On the final question, handleNext() now actually calls
 *   POST /assessment/submit with the real answers and waits for a
 *   real score back, instead of just console.log-ing and redirecting.
 * - All visual design/JSX is unchanged from the original file.
 * =====================================================================
 */

type Question = {
  id: number;
  question_text: string;
  options: string[];
  difficulty: string;
};

export default function AssessmentPage() {
  const router = useRouter();
  const params = useParams();
  const skillParam = (params.skill as string) || "";
  // Capitalized version for display (e.g. "python" -> "Python"),
  // matching how skill names are actually stored in the database.
  const skillDisplayName =
    skillParam.charAt(0).toUpperCase() + skillParam.slice(1);

  /**
   * -------------------------------------------------------------------
   * DATA-LOADING STATE
   * -------------------------------------------------------------------
   */
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  /**
   * -------------------------------------------------------------------
   * ASSESSMENT STATE
   * -------------------------------------------------------------------
   */
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  /**
   * Answers are now stored by question ID -> the SELECTED ANSWER TEXT
   * (not an option index). This matches exactly what
   * POST /assessment/submit expects: { "1": "def", "2": "..." }
   */
  const [answers, setAnswers] = useState<Record<number, string>>({});

  // Submission state for the final "Complete assessment" step.
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /**
   * -------------------------------------------------------------------
   * LOAD REAL QUESTIONS FROM THE BACKEND
   * -------------------------------------------------------------------
   * Runs once when the page loads (or if the skill in the URL
   * changes). Replaces the old hardcoded questions array entirely.
   */
  useEffect(() => {
    if (!skillParam) return;

    setLoading(true);
    setLoadError(null);

    apiGet<{ skill_name: string; questions: Question[] }>(
      `/assessment/questions/${skillParam}`
    )
      .then((data) => {
        setQuestions(data.questions);
        setLoading(false);
      })
      .catch((err) => {
        setLoadError(
          err instanceof Error ? err.message : "Failed to load questions."
        );
        setLoading(false);
      });
  }, [skillParam]);

  const currentQuestion = questions[currentQuestionIndex];
 const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const totalQuestions = questions.length;
  const currentQuestionNumber = currentQuestionIndex + 1;
// Progress is based on how many questions have actually been
// ANSWERED (not just how far the user has scrolled/clicked to),
// so the bar only reaches 100% once the final question is
// actually answered — not just arrived at.
const answeredCount = Object.keys(answers).length;
const progressPercentage =
  totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  /**
   * -------------------------------------------------------------------
   * SELECT ANSWER
   * -------------------------------------------------------------------
   * Now stores the actual answer TEXT the user clicked, not its
   * index — this is what the backend needs to compare against the
   * real correct_answer.
   */
  function selectAnswer(optionText: string) {
    if (!currentQuestion) return;
    setAnswers((previousAnswers) => {
      const updated = {
        ...previousAnswers,
        [currentQuestion.id]: optionText,
      };
      return updated;
    });
  }
  /**
   * -------------------------------------------------------------------
   * NEXT QUESTION / SUBMIT ASSESSMENT
   * -------------------------------------------------------------------
   */
  async function handleNext() {
    if (currentAnswer === undefined) return;

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((previousIndex) => previousIndex + 1);
      return;
    }

    // ---------------------------------------------------------------
    // FINAL QUESTION — actually submit to the backend for real
    // scoring, instead of the old console.log + immediate redirect.
    // ---------------------------------------------------------------
    setSubmitting(true);
    setSubmitError(null);

    try {
      await apiPost("/assessment/submit", {
        skill_name: skillDisplayName,
        answers,
      });

      // Real submission succeeded — now it's safe to move on.
      router.push("/matches");
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Something went wrong submitting your assessment."
      );
    } finally {
      setSubmitting(false);
    }
  }

  /**
   * -------------------------------------------------------------------
   * PREVIOUS QUESTION
   * -------------------------------------------------------------------
   */
  function handleBack() {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((previousIndex) => previousIndex - 1);
      return;
    }
    router.push("/onboarding");
  }

  // ---------------------------------------------------------------
  // LOADING / ERROR STATES — shown while fetching real questions.
  // Kept minimal since these are new states the original file
  // didn't need (it had hardcoded data available instantly).
  // ---------------------------------------------------------------
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8faff]">
        <p className="text-sm text-slate-500">Loading assessment...</p>
      </main>
    );
  }

  if (loadError || !currentQuestion) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8faff] px-6 text-center">
        <div>
          <p className="text-sm font-semibold text-red-600">
            {loadError || "No questions found for this skill."}
          </p>
          <button
            onClick={() => router.push("/onboarding")}
            className="mt-4 text-sm font-semibold text-brand-accent"
          >
            Back to profile
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8faff] text-brand-ink">
      {/* ===============================================================
          HEADER
      =============================================================== */}
      <header className="border-b border-slate-100 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo-icon.png"
              alt="AI Career Navigator"
              width={34}
              height={34}
              priority
            />
            <span className="text-base font-bold text-brand-navy">
              AI <span className="text-brand-accent">Career Navigator</span>
            </span>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3.5 py-2 text-xs font-semibold text-brand-accent sm:flex">
            <BrainCircuit size={14} />
            Skill Assessment
          </div>
        </div>
      </header>

      {/* ===============================================================
          PAGE BACKGROUND
      =============================================================== */}
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-48 -top-40 h-[500px] w-[500px] rounded-full bg-blue-100/60 blur-3xl" />
        <div className="pointer-events-none absolute -left-52 top-[450px] h-[450px] w-[450px] rounded-full bg-indigo-100/40 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.025] [background-image:linear-gradient(to_right,#1e3a8a_1px,transparent_1px),linear-gradient(to_bottom,#1e3a8a_1px,transparent_1px)] [background-size:40px_40px]" />

        <div className="relative mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
          {/* ===========================================================
              PAGE HEADING
          =========================================================== */}
          <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-accent shadow-sm">
                <Sparkles size={13} />
                Map your abilities
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
                Skill Assessment
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Answer a few focused questions so we can understand your
                current skill level and map careers that fit.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <CircleHelp size={18} className="text-brand-accent" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Current question
                </p>
                <p className="text-sm font-bold text-brand-navy">
                  {currentQuestionNumber} of {totalQuestions}
                </p>
              </div>
            </div>
          </div>

          {/* ===========================================================
              OVERALL PROGRESS
          =========================================================== */}
          <div className="mb-8 rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Route size={16} className="text-brand-accent" />
                <span className="text-xs font-semibold text-brand-navy">
                  Assessment progress
                </span>
              </div>
              <span className="text-xs font-bold text-brand-accent">
                {Math.round(progressPercentage)}%
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-accent to-blue-400 transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-[10px] font-medium text-slate-400">
              <span>Starting point</span>
              <span>Skill map complete</span>
            </div>
          </div>

          {/* ===========================================================
              MAIN ASSESSMENT GRID
          =========================================================== */}
          <div className="grid items-start gap-8 lg:grid-cols-[1fr_330px]">
            {/* =========================================================
                QUESTION CARD
            ========================================================= */}
            <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-xl shadow-slate-900/[0.04]">
              <div className="border-b border-slate-100 bg-gradient-to-r from-white to-blue-50/40 px-6 py-6 sm:px-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-brand-accent">
                      <Code2 size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                        Skill being assessed
                      </p>
                      <h2 className="mt-0.5 text-base font-bold text-brand-navy">
                        {skillDisplayName}
                      </h2>
                    </div>
                  </div>

                  <span className="w-fit rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-accent">
                    {currentQuestion.difficulty}
                  </span>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand-accent">
                  Question {currentQuestionNumber}
                </p>

                <h2 className="mt-3 max-w-2xl text-xl font-bold leading-8 text-brand-navy sm:text-2xl">
                  {currentQuestion.question_text}
                </h2>

                <p className="mt-3 text-sm text-slate-400">
                  Choose the answer that best reflects your current
                  experience.
                </p>

                {/* =====================================================
                    ANSWER OPTIONS
                ===================================================== */}
                <div className="mt-8 space-y-3">
                  {currentQuestion.options.map((option, optionIndex) => {
                    const isSelected = currentAnswer === option;

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => selectAnswer(option)}
                        className={`
                          group flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-200 sm:p-5
                          ${
                            isSelected
                              ? "border-brand-accent bg-blue-50/70 shadow-md shadow-blue-950/[0.05] ring-1 ring-brand-accent"
                              : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-md"
                          }
                        `}
                      >
                        <div
                          className={`
                            flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition
                            ${
                              isSelected
                                ? "border-brand-accent bg-brand-accent"
                                : "border-slate-300 bg-white group-hover:border-blue-300"
                            }
                          `}
                        >
                          {isSelected && (
                            <Check size={13} strokeWidth={3} className="text-white" />
                          )}
                        </div>

                        <span
                          className={`flex-1 text-sm font-medium leading-6 ${
                            isSelected ? "text-brand-navy" : "text-slate-600"
                          }`}
                        >
                          {option}
                        </span>

                        <span
                          className={`
                            flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition
                            ${
                              isSelected
                                ? "bg-brand-accent text-white"
                                : "bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-brand-accent"
                            }
                          `}
                        >
                          {String.fromCharCode(65 + optionIndex)}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Submission error, if POST /assessment/submit fails
                    on the final question */}
                {submitError && (
                  <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                    {submitError}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-5 sm:px-8">
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition-all hover:border-slate-300 hover:text-brand-navy"
                >
                  <ArrowLeft size={15} />
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={currentAnswer === undefined || submitting}
                  className="
                    group inline-flex items-center gap-2 rounded-xl bg-brand-accent px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/15 transition-all
                    hover:-translate-y-0.5 hover:bg-brand-navy hover:shadow-xl
                    disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:bg-brand-accent disabled:hover:shadow-lg
                  "
                >
                  {submitting
                    ? "Submitting..."
                    : currentQuestionNumber === totalQuestions
                    ? "Complete assessment"
                    : "Next question"}
                  <ArrowRight
                    size={15}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </button>
              </div>
            </section>

            {/* =========================================================
                RIGHT SIDE PANEL
            ========================================================= */}
            <aside className="space-y-5 lg:sticky lg:top-28">
              <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-brand-navy via-[#173c73] to-brand-accent p-6 text-white shadow-xl shadow-blue-950/15">
                <Compass
                  size={180}
                  strokeWidth={0.6}
                  className="absolute -right-12 -top-12 text-white/10"
                />

                <svg
                  viewBox="0 0 300 220"
                  fill="none"
                  className="pointer-events-none absolute bottom-0 left-0 h-48 w-full opacity-40"
                >
                  <path
                    d="M-10 205 C50 145 70 175 110 125 C150 75 180 130 215 80 C245 38 270 65 320 10"
                    stroke="#93C5FD"
                    strokeWidth="2"
                    strokeDasharray="6 7"
                  />
                  <circle cx="110" cy="125" r="5" fill="#ffffff" />
                  <circle cx="215" cy="80" r="5" fill="#ffffff" />
                  <circle cx="285" cy="44" r="7" fill="#34D399" />
                </svg>

                <div className="relative z-10">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
                    <BrainCircuit size={21} />
                  </div>

                  <p className="mt-6 text-xs font-semibold uppercase tracking-[0.15em] text-blue-200">
                    Mapping your skills
                  </p>

                  <h3 className="mt-2 text-xl font-bold">
                    Every answer makes your map clearer.
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-blue-100/75">
                    Your responses help us understand your current abilities
                    before comparing them with career requirements.
                  </p>

                  <div className="mt-8 space-y-3">
                    <AssessmentRouteItem
                      text="Profile complete"
                      icon={<Check size={13} />}
                      completed
                    />
                    <AssessmentRouteItem
                      text="Skill assessment"
                      icon={<BrainCircuit size={13} />}
                      active
                    />
                    <AssessmentRouteItem
                      text="Career matching"
                      icon={<Compass size={13} />}
                    />
                    <AssessmentRouteItem
                      text="Personal roadmap"
                      icon={<Target size={13} />}
                    />
                  </div>
                </div>
              </div>

              {/* =======================================================
                  CURRENT SKILL CARD
              ======================================================= */}
              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-900/[0.03]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-accent">
                      Current focus
                    </p>
                    <h3 className="mt-1 text-base font-bold text-brand-navy">
                      {skillDisplayName}
                    </h3>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-brand-accent">
                    <Target size={18} />
                  </div>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Your answer
                  </p>

                  {currentAnswer !== undefined ? (
                    <div className="mt-3 flex items-start gap-2.5 rounded-xl bg-emerald-50 p-3">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                        <Check size={11} strokeWidth={3} />
                      </div>
                      <p className="text-xs leading-5 text-emerald-800">
                        {currentAnswer}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-2 text-xs leading-5 text-slate-400">
                      Select the option that best represents your current
                      experience.
                    </p>
                  )}
                </div>
              </div>

              {/* =======================================================
                  HELPFUL NOTE
              ======================================================= */}
              <div className="flex gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4">
                <Lightbulb size={17} className="mt-0.5 shrink-0 text-amber-600" />
                <div>
                  <p className="text-xs font-bold text-amber-900">
                    Answer naturally
                  </p>
                  <p className="mt-1 text-xs leading-5 text-amber-800/70">
                    Choose the answer that best represents where you are
                    today.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}

/**
 * =====================================================================
 * ASSESSMENT ROUTE ITEM
 * =====================================================================
 */
function AssessmentRouteItem({
  text,
  icon,
  active = false,
  completed = false,
}: {
  text: string;
  icon: React.ReactNode;
  active?: boolean;
  completed?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`
          flex h-8 w-8 shrink-0 items-center justify-center rounded-full border
          ${
            completed
              ? "border-emerald-400/30 bg-emerald-400 text-brand-navy"
              : active
              ? "border-white/30 bg-white text-brand-accent"
              : "border-white/10 bg-white/5 text-blue-200"
          }
        `}
      >
        {icon}
      </div>

      <span
        className={`text-xs ${
          active
            ? "font-semibold text-white"
            : completed
            ? "font-medium text-emerald-200"
            : "text-blue-100/60"
        }`}
      >
        {text}
      </span>

      {active && (
        <span className="ml-auto rounded-full bg-blue-300/15 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-blue-200">
          Current
        </span>
      )}
    </div>
  );
}