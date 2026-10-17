"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  BriefcaseBusiness,
  Check,
  Compass,
  GraduationCap,
  Laptop,
  MapPin,
  Sparkles,
  Target,
  UserRound,
} from "lucide-react";
import { apiGet, apiPut, apiPost } from "@/lib/api/client";
import { useAppStore } from "@/lib/store/app-store";

/**
 * =====================================================================
 * AI CAREER NAVIGATOR — EDIT PROFILE
 * =====================================================================
 *
 * FILE:
 * frontend/app/(app)/profile/edit/page.tsx
 *
 * PURPOSE:
 * Lets an existing user update their profile fields after initial
 * onboarding. Reuses the same fields as onboarding, but fetches
 * current values via GET /profile and saves via PUT /profile
 * instead of POST — both already built and tested in Sprint 2.
 *
 * ---------------------------------------------------------------------
 * CONFIRMED SAFE, ISOLATED CHANGE (profile fields)
 * ---------------------------------------------------------------------
 * None of these profile fields (education, experience_years,
 * career_goal, work_preference, industry_interest) are ever read by career
 * matching, gap analysis, or roadmap generation/recalculation —
 * those are driven entirely by user_skills.assessed_level (real,
 * tested scores). Editing this profile data has zero downstream
 * effect on any calculation anywhere in the app.
 *
 * Email and password are deliberately NOT editable here — that
 * would require real auth flows (email re-verification, password
 * confirmation) that are out of scope given the project timeline.
 *
 * ---------------------------------------------------------------------
 * ADD SKILLS (per supervisor feedback)
 * ---------------------------------------------------------------------
 * Lets a user add MORE skills after initial onboarding, reusing the
 * same selection-only pattern and POST /profile/skills endpoint.
 * A newly added skill starts as source='selected' (untested) — it
 * has NO effect on matching/gap/roadmap until the user actually
 * takes its real assessment (same rule as every skill in the
 * system). Existing roadmaps stay frozen until "Refresh roadmap"
 * is clicked, consistent with the rest of the app's design.
 *
 * ---------------------------------------------------------------------
 * TARGET CAREER (replaces the old free-text "Career goal" box)
 * ---------------------------------------------------------------------
 * The old "Career goal" box was saved but never read by anything, so
 * typing in it changed nothing. It is replaced by a real "Target
 * career" picker that DOES change things: the dashboard, the gap
 * analysis and the roadmap all follow the user's current target.
 *
 * HOW A SWITCH WORKS (two backend calls + one store refresh):
 *   1. POST /roadmap/generate { career_id } — returns the user's
 *      existing roadmap for that career, or generates a new one
 *      (an AI call, so it can take a few seconds).
 *   2. If the roadmap ALREADY existed, POST /roadmap/activate — the
 *      backend treats the most recently updated roadmap as the
 *      target, and an old roadmap's timestamp never changes by
 *      itself, so activate stamps it. (A brand-new roadmap is
 *      already the newest, so it needs no activate call.)
 *   3. loadSummary({ force: true }) — one call refreshes the shared
 *      store, so the sidebar links, dashboard and chat panel all show
 *      the new target at once.
 * Nothing is deleted: every roadmap and its progress is kept, and the
 * user can switch back any time. The career list comes from
 * GET /careers/match, which also gives each career's match percentage.
 * The stored career_goal text is still loaded and re-sent unchanged
 * on save so no existing data is lost; it just has no input anymore.
 *
 * ---------------------------------------------------------------------
 * SHARED DATA (ZUSTAND) — WHAT CHANGED
 * ---------------------------------------------------------------------
 * "Currently selected" skills used to be fetched here from
 * /skills/my-levels into a private useState, and after "Add skills"
 * the page patched that private copy by hand. Every OTHER page that
 * knows the user's skills (the layout's onboarding gate, the
 * assessment picker, the chat panel) never heard about the new ones
 * until its own next fetch — the classic "two copies disagree"
 * problem. See frontend/lib/store/app-store.ts for the full story and
 * why Zustand was chosen.
 *
 * Now the selected skills come from the shared store (`levels`) and
 * mySkills is DERIVED from it, not stored again. After POST
 * /profile/skills succeeds we call loadLevels({ force: true }): that
 * re-reads the truth from the server and updates the store, so this
 * page and every other page see the new skills at once. No manual
 * patching, nothing to forget.
 *
 * What stays in useState on purpose:
 *   - the form fields and saving/saved/error flags (this page's own
 *     UI state),
 *   - the skills CATALOG (/skills): only this page and onboarding use
 *     it, so there is nothing to share,
 *   - which new skills are ticked (newlySelectedIds): a temporary
 *     choice that should vanish when the user leaves.
 * =====================================================================
 */

type SkillOption = { id: number; name: string };

// One entry of GET /careers/match (all careers, best match first).
type CareerOption = {
  career_id: number;
  title: string;
  compatibility_score: number;
};

export default function EditProfilePage() {
  const router = useRouter();

  const [education, setEducation] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [careerGoal, setCareerGoal] = useState("");
  const [workPreference, setWorkPreference] = useState("");
  const [industryInterest, setIndustryInterest] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Skills — add-more UI
  const [availableSkills, setAvailableSkills] = useState<SkillOption[]>([]);

  // The user's selected skills come from the shared store. `levels`
  // lists every skill with its source; source === null means the user
  // never selected it, so we keep only the selected ones.
  const levels = useAppStore((s) => s.levels);
  const loadLevels = useAppStore((s) => s.loadLevels);
  const mySkills = (levels ?? []).filter((s) => s.source !== null);

  const [newlySelectedIds, setNewlySelectedIds] = useState<number[]>([]);
  const [skillsSaving, setSkillsSaving] = useState(false);
  const [skillsMessage, setSkillsMessage] = useState<string | null>(null);

  // Target career — the current target comes from the shared summary
  // (the same data the dashboard shows), so the two can never disagree.
  const summary = useAppStore((s) => s.summary);
  const loadSummary = useAppStore((s) => s.loadSummary);
  const currentCareerId = summary?.has_roadmap
    ? summary.career_id ?? null
    : null;

  const [careers, setCareers] = useState<CareerOption[]>([]);
  // "" = the user has not touched the picker, so it shows the current
  // target. Derived below instead of copied into state with an effect.
  const [pickedCareerId, setPickedCareerId] = useState<number | "">("");
  const selectedCareerId =
    pickedCareerId === "" ? currentCareerId ?? "" : pickedCareerId;
  const [careerSwitching, setCareerSwitching] = useState(false);
  const [careerMessage, setCareerMessage] = useState<string | null>(null);
  const [careerError, setCareerError] = useState<string | null>(null);

  /**
   * -------------------------------------------------------------------
   * LOAD CURRENT PROFILE VALUES
   * -------------------------------------------------------------------
   */
  useEffect(() => {
    apiGet<{
      education: string | null;
      experience_years: number | null;
      career_goal: string | null;
      work_preference: string | null;
      industry_interest: string | null;
    }>("/profile")
      .then((data) => {
        setEducation(data.education || "");
        setExperienceYears(
          data.experience_years !== null ? String(data.experience_years) : ""
        );
        setCareerGoal(data.career_goal || "");
        setWorkPreference(data.work_preference || "");
        setIndustryInterest(data.industry_interest || "");
        setLoading(false);
      })
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "Failed to load your profile."
        );
        setLoading(false);
      });
  }, []);

  /**
   * -------------------------------------------------------------------
   * LOAD SKILLS DATA — full catalog + user's current selections
   * -------------------------------------------------------------------
   */
  useEffect(() => {
    apiGet<{ skills: SkillOption[] }>("/skills")
      .then((data) => setAvailableSkills(data.skills))
      .catch(() => {});

    // Cached copy is fine here: the layout's onboarding gate already
    // refreshes `levels` on every navigation, and this page refreshes
    // it itself after adding skills (see handleAddSkills).
    loadLevels().catch(() => {});

    // Careers for the target picker + the current target (cached is
    // fine: every switch below refreshes the summary itself).
    apiGet<{ matches: CareerOption[] }>("/careers/match")
      .then((data) => setCareers(data.matches))
      .catch(() => {});
    loadSummary().catch(() => {});
  }, [loadLevels, loadSummary]);

  /**
   * -------------------------------------------------------------------
   * SAVE PROFILE CHANGES
   * -------------------------------------------------------------------
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaved(false);
    setSaving(true);

    try {
      await apiPut("/profile", {
        education: education || null,
        experience_years: experienceYears ? Number(experienceYears) : null,
        career_goal: careerGoal || null,
        work_preference: workPreference || null,
        industry_interest: industryInterest || null,
      });
      setSaved(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save your changes."
      );
    } finally {
      setSaving(false);
    }
  }

  /**
   * -------------------------------------------------------------------
   * ADD NEWLY SELECTED SKILLS
   * -------------------------------------------------------------------
   */
  async function handleAddSkills() {
    if (newlySelectedIds.length === 0) return;
    setSkillsSaving(true);
    setSkillsMessage(null);

    try {
      await apiPost("/profile/skills", { skill_ids: newlySelectedIds });
      setSkillsMessage(
        "Skills added! Visit the assessment page to test them — until then, they won't affect your matches."
      );
      // Re-read the truth from the server and update the shared store,
      // so every page sees the new skills (not just this one).
      await loadLevels({ force: true }).catch(() => {});
      setNewlySelectedIds([]);
    } catch (err) {
      setSkillsMessage("Failed to add skills. Please try again.");
    } finally {
      setSkillsSaving(false);
    }
  }

  /**
   * -------------------------------------------------------------------
   * SWITCH TARGET CAREER
   * -------------------------------------------------------------------
   */
  async function handleSwitchCareer() {
    if (selectedCareerId === "" || selectedCareerId === currentCareerId) return;
    setCareerSwitching(true);
    setCareerMessage(null);
    setCareerError(null);

    try {
      // 1) Get (or generate) the roadmap for the chosen career.
      const roadmap = await apiPost<{
        roadmap_id: number;
        career_title: string;
        already_existed: boolean;
      }>("/roadmap/generate", { career_id: selectedCareerId });

      // 2) An older roadmap must be made the current one explicitly;
      //    a brand-new one is already the newest.
      if (roadmap.already_existed) {
        await apiPost("/roadmap/activate", { career_id: selectedCareerId });
      }

      // 3) One refresh updates the dashboard, sidebar and chat panel.
      await loadSummary({ force: true });

      setPickedCareerId("");
      setCareerMessage(
        `Target career changed to ${roadmap.career_title}. Your other roadmaps and their progress are kept.`
      );
    } catch (err) {
      setCareerError(
        err instanceof Error
          ? err.message
          : "Could not change your target career. Please try again."
      );
    } finally {
      setCareerSwitching(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8faff]">
        <p className="text-sm text-slate-500">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="relative min-w-0 flex-1 overflow-hidden">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-accent shadow-sm">
          <Sparkles size={13} />
          Your profile
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
          Edit profile
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
          Update your background and goals. Profile fields don&apos;t affect
          your assessed skills, career matches, or roadmap — those only
          ever come from real skill assessments. Your target career below
          does change your dashboard, gap analysis and roadmap.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-xl shadow-slate-900/[0.04]"
        >
          <div className="space-y-6 p-6 sm:p-8">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Highest education" icon={<GraduationCap size={15} />}>
                <select
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  className={selectClasses}
                >
                  <option value="">Select your education</option>
                  <option value="high-school">High school</option>
                  <option value="diploma">Diploma / Certificate</option>
                  <option value="associate">Associate degree</option>
                  <option value="bachelor">Bachelor&apos;s degree</option>
                  <option value="master">Master&apos;s degree</option>
                  <option value="doctorate">Doctorate</option>
                  <option value="other">Other</option>
                </select>
              </Field>

              <Field label="Years of experience" icon={<BriefcaseBusiness size={15} />}>
                <select
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  className={selectClasses}
                >
                  <option value="">Select experience</option>
                  <option value="0">No professional experience</option>
                  <option value="1">Less than 1 year</option>
                  <option value="2">1–2 years</option>
                  <option value="3">3–5 years</option>
                  <option value="6">6–10 years</option>
                  <option value="11">10+ years</option>
                </select>
              </Field>
            </div>

            <div>
              <Field label="Target career" icon={<Target size={15} />}>
                <select
                  value={selectedCareerId}
                  onChange={(e) =>
                    setPickedCareerId(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  disabled={careerSwitching}
                  className={selectClasses}
                >
                  <option value="">Select a career</option>
                  {careers.map((career) => (
                    <option key={career.career_id} value={career.career_id}>
                      {career.title} — {career.compatibility_score}% match
                      {career.career_id === currentCareerId ? " (current)" : ""}
                    </option>
                  ))}
                </select>
              </Field>

              <p className="mt-2 text-xs text-slate-400">
                Switching keeps your other roadmaps and their progress, and you
                can switch back anytime. A career you have not used before gets
                a new roadmap, which can take a few seconds.
              </p>

              {selectedCareerId !== "" &&
                selectedCareerId !== currentCareerId && (
                  <button
                    type="button"
                    onClick={handleSwitchCareer}
                    disabled={careerSwitching}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-accent px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-500/15 transition-all hover:bg-brand-navy disabled:opacity-60"
                  >
                    {careerSwitching ? "Switching..." : "Switch target career"}
                  </button>
                )}

              {careerMessage && (
                <p className="mt-3 text-xs text-emerald-600">{careerMessage}</p>
              )}

              {careerError && (
                <p className="mt-3 text-xs text-red-600">{careerError}</p>
              )}
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Work preference" icon={<Laptop size={15} />}>
                <select
                  value={workPreference}
                  onChange={(e) => setWorkPreference(e.target.value)}
                  className={selectClasses}
                >
                  <option value="">Select preference</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">On-site</option>
                  <option value="flexible">No preference</option>
                </select>
              </Field>

              <Field label="Industry interest" icon={<MapPin size={15} />}>
                <select
                  value={industryInterest}
                  onChange={(e) => setIndustryInterest(e.target.value)}
                  className={selectClasses}
                >
                  <option value="">Select industry</option>
                  <option value="technology">Technology</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="finance">Finance</option>
                  <option value="education">Education</option>
                  <option value="engineering">Engineering</option>
                  <option value="business">Business</option>
                  <option value="other">Other</option>
                </select>
              </Field>
            </div>

            <div className="h-px bg-slate-100" />

            <div>
              <h3 className="mb-1 text-sm font-bold text-brand-navy">Your skills</h3>
              <p className="mb-4 text-xs text-slate-400">
                Currently selected:{" "}
                {mySkills.length > 0
                  ? mySkills.map((s) => s.skill_name).join(", ")
                  : "None yet"}
              </p>

              <div className="flex flex-wrap gap-1.5">
                {availableSkills
                  .filter((s) => !mySkills.some((m) => m.skill_id === s.id))
                  .map((skill) => (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() =>
                        setNewlySelectedIds((current) =>
                          current.includes(skill.id)
                            ? current.filter((id) => id !== skill.id)
                            : [...current, skill.id]
                        )
                      }
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold transition ${
                        newlySelectedIds.includes(skill.id)
                          ? "border-brand-accent bg-brand-accent text-white"
                          : "border-blue-100 bg-white text-brand-accent hover:bg-blue-50"
                      }`}
                    >
                      + {skill.name}
                    </button>
                  ))}
              </div>

              {availableSkills.length > 0 &&
                availableSkills.every((s) => mySkills.some((m) => m.skill_id === s.id)) && (
                  <p className="mt-2 text-xs text-slate-400">
                    You&apos;ve already selected every available skill.
                  </p>
                )}

              {newlySelectedIds.length > 0 && (
                <button
                  type="button"
                  onClick={handleAddSkills}
                  disabled={skillsSaving}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-accent px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-500/15 transition-all hover:bg-brand-navy disabled:opacity-60"
                >
                  {skillsSaving
                    ? "Adding..."
                    : `Add ${newlySelectedIds.length} skill${newlySelectedIds.length > 1 ? "s" : ""}`}
                </button>
              )}

              {skillsMessage && (
                <p className="mt-3 text-xs text-emerald-600">{skillsMessage}</p>
              )}
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

            {saved && (
              <p className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <Check size={15} />
                Profile updated successfully.
              </p>
            )}
          </div>

          <div className="flex items-center justify-end border-t border-slate-100 bg-slate-50/50 px-6 py-5 sm:px-8">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-accent px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/15 transition-all hover:-translate-y-0.5 hover:bg-brand-navy disabled:opacity-70"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputClasses = `
  h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm
  text-brand-navy outline-none transition-all placeholder:text-slate-400
  focus:border-brand-accent focus:ring-4 focus:ring-blue-50
`;

const selectClasses = `
  h-12 w-full cursor-pointer rounded-xl border border-slate-200 bg-white
  px-4 text-sm text-brand-navy outline-none transition-all
  focus:border-brand-accent focus:ring-4 focus:ring-blue-50
`;

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-xs font-semibold text-brand-navy">
        <span className="text-slate-400">{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}