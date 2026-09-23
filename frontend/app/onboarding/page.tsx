"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Check,
  Compass,
  GraduationCap,
  Laptop,
  MapPin,
  Plus,
  Route,
  Sparkles,
  Target,
  UserRound,
  X,
} from "lucide-react";
import { createClient } from "@/lib/auth/supabase-client";
import { apiGet, apiPost } from "@/lib/api/client";

/**
 * =====================================================================
 * AI CAREER NAVIGATOR — PROFILE / ONBOARDING
 * =====================================================================
 *
 * FILE:
 * frontend/app/onboarding/page.tsx
 *
 * PURPOSE:
 * Collect the structured user profile that later features depend on.
 * This is the FIRST-TIME setup flow a new user goes through right
 * after registering — distinct from a future "edit profile" page,
 * which would reuse similar UI but call GET/PUT instead of POST.
 *
 * ---------------------------------------------------------------------
 * BACKEND WIRING — WHAT'S CONNECTED AND WHAT ISN'T
 * ---------------------------------------------------------------------
 *
 * CONNECTED: education, experienceYears, careerGoal, workPreference,
 * industryInterest — these map directly to columns on the `profiles`
 * table and are sent via apiPost("/profile", ...) on submit.
 *
 * full_name is NOT a form field — it's pulled automatically from the
 * user's Supabase auth metadata (captured at registration), since
 * asking them to retype their own name would be redundant. It's
 * required by the backend's ProfileCreate schema, so this page fetches
 * it via useUser-style logic and includes it in the POST body.
 *
 * SKILLS — free-text entry, exactly like the original static version:
 * a user can type ANY skill, including ones not in our seeded catalog
 * (e.g. "Next.js", "Docker") — there is no restriction. Real skills
 * from GET /skills are shown as small clickable "+ SkillName"
 * suggestion pills ABOVE the input purely as a convenient shortcut,
 * not a requirement — clicking one just adds it instantly, but
 * typing anything else works exactly the same as before. This
 * profile field is deliberately informational/self-descriptive only;
 * it is NOT what drives assessment or matching (that only ever comes
 * from the real assessment flow in Sprint 3, or the capped
 * activity-logging system in Sprint 6), so restricting it to a
 * fixed catalog would be more limiting than useful. Persistence to
 * the backend is still deliberately deferred — this stays local UI
 * state. The section starts empty — no pre-filled assumptions about
 * what the user already knows.
 *
 * Redirects to /assessment/python on success.
 * =====================================================================
 */

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  /**
   * -------------------------------------------------------------------
   * FORM STATE
   * -------------------------------------------------------------------
   */

  const [education, setEducation] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [careerGoal, setCareerGoal] = useState("");
  const [workPreference, setWorkPreference] = useState("");
  const [industryInterest, setIndustryInterest] = useState("");

  // Full name isn't a visible field — it's fetched from the logged-in
  // user's auth metadata (set during registration) and sent silently
  // as part of the profile creation request, since the backend
  // requires it but the user already provided it once at signup.
  const [fullName, setFullName] = useState<string | null>(null);

  // Loading/error state for the actual save request, separate from
  // any per-field validation — this tracks the network call itself.
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Skills are stored as an array because the user can add/remove them.
   * Starts empty — no pre-filled placeholder assumptions about what
   * the user already knows. NOTE: intentionally NOT sent to the
   * backend on submit — see file header comment for why.
   */
  const [skills, setSkills] = useState<string[]>([]);

  const [skillInput, setSkillInput] = useState("");

  // Real skills fetched from the database — used only to render
  // clickable suggestion pills above the input, as a convenient
  // shortcut. Does NOT restrict what the user can type/add.
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);

  useEffect(() => {
    apiGet<{ skills: { id: number; name: string }[] }>("/skills")
      .then((data) => {
        setAvailableSkills(data.skills.map((s) => s.name));
      })
      .catch(() => {
        // Fail silently — if this fails, no suggestion pills render,
        // but free-text typing still works fine either way.
      });
  }, []);

  /**
   * -------------------------------------------------------------------
   * LOAD THE USER'S NAME FROM THEIR SESSION
   * -------------------------------------------------------------------
   * Runs once when the page loads. Reads full_name out of the auth
   * metadata that was set during registration (or from Google's
   * profile data, if they signed up via Google OAuth).
   */
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const name =
        data.user?.user_metadata?.full_name ||
        data.user?.user_metadata?.name ||
        null;
      setFullName(name);
    });
  }, []);

  /**
   * -------------------------------------------------------------------
   * ADD SKILL (via typing + Add button, or Enter key)
   * -------------------------------------------------------------------
   *
   * Adds whatever the user typed — no restriction to a fixed skill
   * catalog. We still:
   * - remove surrounding spaces
   * - prevent empty skills
   * - prevent duplicate skills
   */

  function addSkill() {
    const cleanedSkill = skillInput.trim();

    if (!cleanedSkill) return;

    const alreadyExists = skills.some(
      (skill) => skill.toLowerCase() === cleanedSkill.toLowerCase()
    );

    if (alreadyExists) {
      setSkillInput("");
      return;
    }

    setSkills((currentSkills) => [...currentSkills, cleanedSkill]);
    setSkillInput("");
  }

  /**
   * -------------------------------------------------------------------
   * ADD SKILL VIA SUGGESTION PILL (instant, one click)
   * -------------------------------------------------------------------
   */

  function addSkillDirectly(skillName: string) {
    setSkills((current) => [...current, skillName]);
  }

  /**
   * -------------------------------------------------------------------
   * REMOVE SKILL
   * -------------------------------------------------------------------
   */

  function removeSkill(skillToRemove: string) {
    setSkills((currentSkills) =>
      currentSkills.filter((skill) => skill !== skillToRemove)
    );
  }

  /**
   * -------------------------------------------------------------------
   * ALLOW ENTER TO ADD A SKILL
   * -------------------------------------------------------------------
   */

  function handleSkillKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      addSkill();
    }
  }

  /**
   * -------------------------------------------------------------------
   * FORM SUBMIT
   * -------------------------------------------------------------------
   * Sends the profile fields the backend actually accepts to
   * POST /profile, using the shared apiPost helper (which handles
   * attaching the user's auth token automatically — see
   * lib/api/client.ts). Skills are deliberately excluded from this
   * request; see the file header comment for why.
   */

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    // full_name is required by the backend's ProfileCreate schema.
    // If it's somehow still missing (auth metadata was empty), fail
    // clearly rather than sending an incomplete request that the
    // backend would reject anyway.
    if (!fullName) {
      setError("We couldn't find your name. Please try logging in again.");
      return;
    }

    setSaving(true);

    try {
      await apiPost("/profile", {
        full_name: fullName,
        education: education || null,
        experience_years: experienceYears
          ? Number(experienceYears)
          : null,
        career_goal: careerGoal || null,
        work_preference: workPreference || null,
        industry_interest: industryInterest || null,
      });

      // Profile saved successfully — move to the next onboarding
      // stage. Redirects to a specific skill (Python) as a starting
      // point, since there's no skill-selection screen in the
      // wireframes yet.
      router.push("/assessment/python");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong saving your profile."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8faff] text-brand-ink">
      {/* ===============================================================
          HEADER
      =============================================================== */}

      <header className="border-b border-slate-100 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          {/* LOGO */}
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

          {/* Small onboarding badge */}
          <div className="hidden items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3.5 py-2 text-xs font-semibold text-brand-accent sm:flex">
            <Compass size={14} />
            Profile setup
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

        <div className="relative mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
          {/* ===========================================================
              PAGE INTRO
          =========================================================== */}

          <div className="mb-9 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-accent shadow-sm">
                <Sparkles size={13} />
                Let&apos;s get to know you
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
                Build your profile
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Tell us where you are today so we can understand your
                experience, skills and where you want your career to go.
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="font-bold text-brand-accent">Step 2</span>
              <span>of 3</span>
            </div>
          </div>

          {/* ===========================================================
              PROGRESS ROUTE
          =========================================================== */}

          <div className="mb-10 rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-7">
            <div className="relative grid grid-cols-3 items-start">
              <div className="absolute left-[16%] right-[16%] top-5 h-0.5 bg-slate-100" />
              <div className="absolute left-[16%] top-5 h-0.5 w-[34%] bg-brand-accent" />

              <ProgressStep icon={<Check size={15} />} label="Account" completed />
              <ProgressStep icon={<UserRound size={15} />} label="Profile" active />
              <ProgressStep icon={<Target size={15} />} label="Assessment" />
            </div>
          </div>

          {/* ===========================================================
              MAIN GRID
          =========================================================== */}

          <div className="grid items-start gap-8 lg:grid-cols-[1fr_340px]">
            {/* =========================================================
                PROFILE FORM
            ========================================================= */}

            <form
              onSubmit={handleSubmit}
              className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-xl shadow-slate-900/[0.04]"
            >
              {/* FORM HEADER */}
              <div className="border-b border-slate-100 px-6 py-6 sm:px-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-brand-accent">
                    <UserRound size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-brand-navy">
                      Where are you today?
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-400">
                      This becomes the starting point for your career map.
                    </p>
                  </div>
                </div>
              </div>

              {/* FORM CONTENT */}
              <div className="space-y-8 p-6 sm:p-8">
                {/* SECTION 1 — BACKGROUND */}
                <FormSection
                  icon={<GraduationCap size={17} />}
                  title="Your background"
                  description="Tell us about your education and experience."
                >
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Highest education" icon={<GraduationCap size={15} />}>
                      <select
                        value={education}
                        onChange={(event) => setEducation(event.target.value)}
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
                        onChange={(event) => setExperienceYears(event.target.value)}
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
                </FormSection>

                <div className="h-px bg-slate-100" />

                {/* SECTION 2 — CAREER DIRECTION */}
                <FormSection
                  icon={<Compass size={17} />}
                  title="Your direction"
                  description="Where would you like your career to take you?"
                >
                  <Field label="Career goal" icon={<Target size={15} />}>
                    <input
                      type="text"
                      value={careerGoal}
                      onChange={(event) => setCareerGoal(event.target.value)}
                      placeholder="e.g. AI Engineer"
                      className={inputClasses}
                    />
                  </Field>

                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Work preference" icon={<Laptop size={15} />}>
                      <select
                        value={workPreference}
                        onChange={(event) => setWorkPreference(event.target.value)}
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
                        onChange={(event) => setIndustryInterest(event.target.value)}
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
                </FormSection>

                <div className="h-px bg-slate-100" />

                {/* SECTION 3 — SKILLS (free-text, same as original;
                    real skill names shown as optional clickable
                    suggestions above the input, not a restriction) */}
                <FormSection
                  icon={<Sparkles size={17} />}
                  title="Your current skills"
                  description="Add the skills you already have. You'll assess them next."
                >
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition focus-within:border-blue-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50">
                    {skills.length > 0 && (
                      <div className="mb-4 flex flex-wrap gap-2">
                        {skills.map((skill) => (
                          <SkillTag
                            key={skill}
                            skill={skill}
                            onRemove={() => removeSkill(skill)}
                          />
                        ))}
                      </div>
                    )}

                    {/* Real skills shown as optional quick-pick
                        suggestion pills — a convenient shortcut,
                        never a restriction. Typing anything else in
                        the input below still works exactly the same. */}
                    {availableSkills.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-1.5">
                        {availableSkills
                          .filter((name) => !skills.includes(name))
                          .map((name) => (
                            <button
                              key={name}
                              type="button"
                              onClick={() => addSkillDirectly(name)}
                              className="rounded-full border border-blue-100 bg-white px-2.5 py-1 text-[10px] font-semibold text-brand-accent transition hover:bg-blue-50"
                            >
                              + {name}
                            </button>
                          ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={skillInput}
                        onChange={(event) => setSkillInput(event.target.value)}
                        onKeyDown={handleSkillKeyDown}
                        placeholder="Type a skill..."
                        className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm text-brand-navy outline-none placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={addSkill}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-blue-100 bg-white px-3 py-2 text-xs font-semibold text-brand-accent shadow-sm transition hover:border-blue-200 hover:bg-blue-50"
                      >
                        <Plus size={14} />
                        Add
                      </button>
                    </div>
                  </div>

                  <p className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Sparkles size={12} className="text-brand-accent" />
                    Add technical and professional skills you feel comfortable using.
                  </p>
                </FormSection>

                {/* Save error, if the POST /profile request fails */}
                {error && (
                  <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </p>
                )}
              </div>

              {/* FORM FOOTER */}
              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-5 sm:px-8">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-brand-navy"
                >
                  <ArrowLeft size={15} />
                  Back
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="group inline-flex items-center gap-2 rounded-xl bg-brand-accent px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/15 transition-all hover:-translate-y-0.5 hover:bg-brand-navy hover:shadow-xl disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {saving ? "Saving..." : "Continue"}
                  {!saving && (
                    <ArrowRight
                      size={15}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  )}
                </button>
              </div>
            </form>

            {/* =========================================================
                RIGHT VISUAL PANEL
            ========================================================= */}

            <aside className="space-y-5 lg:sticky lg:top-28">
              <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-brand-navy via-[#173c73] to-brand-accent p-6 text-white shadow-xl shadow-blue-950/15">
                <Compass
                  size={180}
                  strokeWidth={0.6}
                  className="absolute -right-12 -top-12 text-white/10"
                />

                <svg
                  viewBox="0 0 300 200"
                  fill="none"
                  className="pointer-events-none absolute bottom-0 left-0 h-40 w-full opacity-40"
                >
                  <path
                    d="M-20 180 C40 100 80 170 130 100 C175 38 215 105 320 20"
                    stroke="#93C5FD"
                    strokeWidth="2"
                    strokeDasharray="6 7"
                  />
                  <circle cx="130" cy="100" r="5" fill="#ffffff" />
                  <circle cx="280" cy="52" r="7" fill="#34D399" />
                </svg>

                <div className="relative z-10">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
                    <Route size={21} />
                  </div>

                  <p className="mt-6 text-xs font-semibold uppercase tracking-[0.15em] text-blue-200">
                    Your starting point
                  </p>

                  <h3 className="mt-2 text-xl font-bold">
                    Every career path starts somewhere.
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-blue-100/75">
                    Your profile helps us understand where you are before
                    mapping where you could go next.
                  </p>

                  <div className="mt-8 space-y-3">
                    <MapPoint icon={<UserRound size={14} />} text="Your profile" active />
                    <MapPoint icon={<BookOpen size={14} />} text="Skill assessment" />
                    <MapPoint icon={<Compass size={14} />} text="Career matches" />
                    <MapPoint icon={<Target size={14} />} text="Your roadmap" />
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-900/[0.03]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-brand-accent">
                      Profile preview
                    </p>
                    <h3 className="mt-1 text-sm font-bold text-brand-navy">
                      Your career starting point
                    </h3>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-brand-accent">
                    <UserRound size={17} />
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  <PreviewRow label="Goal" value={careerGoal || "Not selected yet"} />
                  <PreviewRow
                    label="Industry"
                    value={industryInterest ? formatValue(industryInterest) : "Not selected yet"}
                  />
                  <PreviewRow
                    label="Work style"
                    value={workPreference ? formatValue(workPreference) : "Not selected yet"}
                  />
                </div>

                <div className="mt-5 border-t border-slate-100 pt-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Skills added
                  </p>

                  {skills.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {skills.slice(0, 5).map((skill) => (
                        <span
                          key={skill}
                          className="rounded-md bg-blue-50 px-2 py-1 text-[10px] font-semibold text-brand-accent"
                        >
                          {skill}
                        </span>
                      ))}
                      {skills.length > 5 && (
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500">
                          +{skills.length - 5}
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-slate-400">Add your first skill.</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                <Sparkles size={17} className="mt-0.5 shrink-0 text-brand-accent" />
                <p className="text-xs leading-5 text-slate-500">
                  Your profile becomes context for your assessments, career
                  matches, skill gaps and personalized roadmap.
                </p>
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
 * SHARED INPUT STYLES
 * =====================================================================
 */

const inputClasses = `
  h-12
  w-full
  rounded-xl
  border
  border-slate-200
  bg-white
  px-4
  text-sm
  text-brand-navy
  outline-none
  transition-all
  placeholder:text-slate-400
  focus:border-brand-accent
  focus:ring-4
  focus:ring-blue-50
`;

const selectClasses = `
  h-12
  w-full
  cursor-pointer
  rounded-xl
  border
  border-slate-200
  bg-white
  px-4
  text-sm
  text-brand-navy
  outline-none
  transition-all
  focus:border-brand-accent
  focus:ring-4
  focus:ring-blue-50
`;

/**
 * =====================================================================
 * PROGRESS STEP
 * =====================================================================
 */

function ProgressStep({
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
        className={`flex h-10 w-10 items-center justify-center rounded-full border-4 border-white text-xs shadow-sm ${
          completed
            ? "bg-emerald-500 text-white"
            : active
            ? "bg-brand-accent text-white"
            : "bg-slate-100 text-slate-400"
        }`}
      >
        {icon}
      </div>
      <p
        className={`mt-2 text-xs font-semibold ${
          active ? "text-brand-accent" : completed ? "text-emerald-600" : "text-slate-400"
        }`}
      >
        {label}
      </p>
    </div>
  );
}

/**
 * =====================================================================
 * FORM SECTION
 * =====================================================================
 */

function FormSection({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-brand-accent">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-bold text-brand-navy">{title}</h3>
          <p className="mt-0.5 text-xs text-slate-400">{description}</p>
        </div>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

/**
 * =====================================================================
 * FIELD
 * =====================================================================
 */

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

/**
 * =====================================================================
 * SKILL TAG
 * =====================================================================
 */

function SkillTag({
  skill,
  onRemove,
}: {
  skill: string;
  onRemove: () => void;
}) {
  return (
    <div className="group inline-flex items-center gap-1.5 rounded-lg bg-brand-navy py-1.5 pl-3 pr-2 text-xs font-medium text-white shadow-sm">
      {skill}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${skill}`}
        className="flex h-5 w-5 items-center justify-center rounded-md text-blue-200 transition hover:bg-white/10 hover:text-white"
      >
        <X size={12} />
      </button>
    </div>
  );
}

/**
 * =====================================================================
 * MAP POINT
 * =====================================================================
 */

function MapPoint({
  icon,
  text,
  active = false,
}: {
  icon: React.ReactNode;
  text: string;
  active?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full border ${
          active
            ? "border-white/30 bg-white text-brand-accent"
            : "border-white/10 bg-white/5 text-blue-200"
        }`}
      >
        {icon}
      </div>
      <span className={`text-xs ${active ? "font-semibold text-white" : "text-blue-100/60"}`}>
        {text}
      </span>
      {active && (
        <span className="ml-auto rounded-full bg-emerald-400/15 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-300">
          You are here
        </span>
      )}
    </div>
  );
}

/**
 * =====================================================================
 * PROFILE PREVIEW ROW
 * =====================================================================
 */

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-slate-400">{label}</span>
      <span className="max-w-[180px] truncate text-right text-xs font-semibold text-brand-navy">
        {value}
      </span>
    </div>
  );
}

/**
 * =====================================================================
 * FORMAT SELECT VALUE
 * =====================================================================
 */

function formatValue(value: string) {
  return value.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}