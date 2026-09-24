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
 * None of these fields (education, experience_years, career_goal,
 * work_preference, industry_interest) are ever read by career
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
 * =====================================================================
 */

type SkillOption = { id: number; name: string };
type MySkill = { skill_id: number; skill_name: string; source: string | null };

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
  const [mySkills, setMySkills] = useState<MySkill[]>([]);
  const [newlySelectedIds, setNewlySelectedIds] = useState<number[]>([]);
  const [skillsSaving, setSkillsSaving] = useState(false);
  const [skillsMessage, setSkillsMessage] = useState<string | null>(null);

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

    apiGet<{ skills: MySkill[] }>("/skills/my-levels")
      .then((data) => setMySkills(data.skills.filter((s) => s.source !== null)))
      .catch(() => {});
  }, []);

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
      setMySkills((current) => [
        ...current,
        ...newlySelectedIds.map((id) => {
          const skill = availableSkills.find((s) => s.id === id);
          return {
            skill_id: id,
            skill_name: skill?.name || "",
            source: "selected",
          };
        }),
      ]);
      setNewlySelectedIds([]);
    } catch (err) {
      setSkillsMessage("Failed to add skills. Please try again.");
    } finally {
      setSkillsSaving(false);
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
          ever come from real skill assessments.
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

            <Field label="Career goal" icon={<Target size={15} />}>
              <input
                type="text"
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value)}
                placeholder="e.g. AI Engineer"
                className={inputClasses}
              />
            </Field>

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