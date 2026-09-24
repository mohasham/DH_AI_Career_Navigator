"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowRight,
  BrainCircuit,
  Check,
  Circle,
  Compass,
  Sparkles,
} from "lucide-react";
import { apiGet } from "@/lib/api/client";

/**
 * =====================================================================
 * SKILL PICKER — /assessment
 * =====================================================================
 *
 * FILE:
 * frontend/app/assessment/page.tsx
 *
 * Lists every real skill, showing the user's current assessed level
 * (if any) so they can see what they've already proven through real
 * testing, and pick a skill to test/retest. This is the genuine
 * entry point the sidebar's "Assessment" link leads to — previously
 * there was no way to reach any skill besides Python through normal
 * navigation.
 *
 * Design matches the rest of the app: branded header, navy/compass
 * background decoration, consistent card styling — same visual
 * language as /matches, /gap, /roadmap, /onboarding.
 * =====================================================================
 */

type SkillWithLevel = {
  skill_id: number;
  skill_name: string;
  assessed_level: number | null;
  source: string | null;
};

export default function AssessmentPickerPage() {
  const router = useRouter();
  const [skills, setSkills] = useState<SkillWithLevel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<{ skills: SkillWithLevel[] }>("/skills/my-levels")
      .then((data) => {
        // Only show skills the user actually selected during
        // onboarding (source is not null) — skills they never
        // claimed to have don't need to be assessed.
        const relevantSkills = data.skills.filter((s) => s.source !== null);
        setSkills(relevantSkills);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8faff]">
        <p className="text-sm text-slate-500">Loading skills...</p>
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
            Skill Assessments
          </div>
        </div>
      </header>

      {/* ===============================================================
          PAGE BACKGROUND DECORATION
      =============================================================== */}
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-48 -top-40 h-[500px] w-[500px] rounded-full bg-blue-100/60 blur-3xl" />
        <div className="pointer-events-none absolute -left-52 top-[500px] h-[450px] w-[450px] rounded-full bg-indigo-100/40 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.025] [background-image:linear-gradient(to_right,#1e3a8a_1px,transparent_1px),linear-gradient(to_bottom,#1e3a8a_1px,transparent_1px)] [background-size:40px_40px]" />

        <div className="relative mx-auto max-w-3xl px-6 py-10 lg:px-8 lg:py-14">
          {/* ===========================================================
              PAGE INTRO
          =========================================================== */}
          <div className="mb-9">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-accent shadow-sm">
              <Sparkles size={13} />
              Prove what you know
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
              Skill assessments
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Take a real assessment to prove your skill level — this is
              the only way to reach a true 100% score. Each skill can only
              be assessed once, so answer carefully. Your results directly
              shape your career matches, gap analysis, and personalized roadmap.
            </p>
          </div>

          {/* ===========================================================
              SKILLS LIST
          =========================================================== */}
          <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-xl shadow-slate-900/[0.04]">
            <div className="border-b border-slate-100 px-6 py-6 sm:px-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-brand-accent">
                  <Compass size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-brand-navy">
                    Choose a skill to assess
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Each skill can only be assessed once. Completed skills are locked.
                  </p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {skills.map((skill) => {
                const tested = skill.source === "tested";
                return (
                  <button
                    key={skill.skill_id}
                    disabled={tested}
                    onClick={() => {
                      if (tested) return;
                      console.log("Navigating to:", `/assessment/${skill.skill_name.toLowerCase()}`)
                      router.push(`/assessment/${skill.skill_name.toLowerCase()}`);
                    }}
                    className={`flex w-full items-center justify-between rounded-2xl border p-5 text-left shadow-sm transition ${tested
                      ? "cursor-not-allowed border-emerald-100 bg-emerald-50/40 opacity-90"
                      : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-brand-accent">
                        <BrainCircuit size={20} />
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-brand-navy">
                          {skill.skill_name}
                        </h3>

                        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                          {skill.assessed_level !== null ? (
                            <>
                              {tested ? (
                                <Check size={12} className="text-emerald-500" />
                              ) : (
                                <Circle size={12} className="text-amber-500" />
                              )}
                              <span
                                className={
                                  tested
                                    ? "font-semibold text-emerald-600"
                                    : "font-semibold text-amber-600"
                                }
                              >
                                {skill.assessed_level}%
                              </span>
                              {tested
                                ? "— verified by assessment"
                                : "— from logged activity, capped at 80%"}
                            </>
                          ) : (
                            "Not assessed yet"
                          )}
                        </p>
                      </div>
                    </div>

                    {tested ? (
                      <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-700">
                        Completed
                      </span>
                    ) : (
                      <ArrowRight size={18} className="shrink-0 text-slate-300 transition group-hover:text-brand-accent" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}