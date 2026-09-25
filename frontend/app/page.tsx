import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  BarChart3,
  Bot,
  BrainCircuit,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  CircleCheck,
  Compass,
  GraduationCap,
  Lightbulb,
  Map,
  MessageCircle,
  Route,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  WandSparkles,
} from "lucide-react";

import { AuthNavButtons } from "@/components/auth-nav-buttons";
import { MobileMenu } from "@/components/mobile-menu";

/**
 * =====================================================================
 * AI CAREER NAVIGATOR — LANDING PAGE
 * =====================================================================
 *
 * FILE:
 * frontend/app/page.tsx
 *
 * DESIGN IDEA
 * ---------------------------------------------------------------------
 *
 * Instead of making the landing page look like a generic software site,
 * the visual language is based around NAVIGATION:
 *
 *   • routes
 *   • destinations
 *   • skill checkpoints
 *   • career cards
 *   • progress
 *   • compass/navigation imagery
 *
 * This connects directly with the name:
 *
 *                  AI CAREER NAVIGATOR
 *
 * ---------------------------------------------------------------------
 * PAGE FLOW
 * ---------------------------------------------------------------------
 *
 * HERO
 *      ↓
 * Profile
 *      ↓
 * Assessment
 *      ↓
 * Career Match
 *      ↓
 * Gap Analysis
 *      ↓
 * Roadmap
 *      ↓
 * AI Career Guidance
 *      ↓
 * CTA
 *
 * ---------------------------------------------------------------------
 * AUTH ROUTES
 * ---------------------------------------------------------------------
 *
 * Login:    /auth/login
 * Register: /auth/register
 *
 * ---------------------------------------------------------------------
 * SESSION-AWARE HEADER
 * ---------------------------------------------------------------------
 *
 * The header's auth buttons use <AuthNavButtons /> instead of
 * hardcoded Log in / Get started links. AuthNavButtons is its own
 * small "use client" component (see components/auth-nav-buttons.tsx)
 * that reads the live Supabase session via useUser() and shows:
 *
 *   - Log in + Get started   → when no session exists
 *   - Dashboard + Log out    → when a session exists
 *
 * HomePage itself stays a Server Component (no "use client" here) —
 * only the small AuthNavButtons piece needs to be a Client Component,
 * so the rest of this page (hero, journey, matching, roadmap, etc.)
 * keeps rendering server-side for better performance.
 *
 * The bottom CTA section still uses static "Create your account" /
 * "Log in" links deliberately — that block is marketing/conversion
 * copy, not primary navigation, so it doesn't need to be session-aware.
 * =====================================================================
 */

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-white font-sans text-brand-ink">
      {/* ===============================================================
          NAVIGATION
      =============================================================== */}

      <header
        className="
          sticky
          top-0
          z-50
          border-b
          border-slate-100/80
          bg-white/85
          backdrop-blur-xl
        "
      >
        <nav
          className="
            mx-auto
            flex
            h-20
            max-w-7xl
            items-center
            justify-between
            px-6
            lg:px-8
          "
        >
     {/* ===========================================================
    LOGO

    Mobile:
    - On small screens such as 375 × 667, only the logo icon
      is displayed to preserve header space.

    Tablet/Desktop:
    - From the "sm" breakpoint (640px) upward, the full
      AI Career Navigator name appears beside the logo.

    Clicking either version returns to the landing page.
=========================================================== */}

<Link
  href="/"
  aria-label="AI Career Navigator home"
  className="
    flex
    shrink-0
    items-center
    gap-2.5
    transition-opacity
    hover:opacity-80
  "
>
  <Image
    src="/logo-icon.png"
    alt="AI Career Navigator"
    width={35}
    height={35}
    priority
    className="shrink-0"
  />

  {/* Hidden on mobile — visible from 640px upward */}
  <span
    className="
      hidden
      text-base
      font-bold
      text-brand-navy
      sm:inline
    "
  >
    AI{" "}
    <span className="text-brand-accent">
      Career Navigator
    </span>
  </span>
</Link>

          {/* DESKTOP LINKS */}

          <div className="hidden items-center gap-8 lg:flex">
            <NavLink href="#journey">
              How it works
            </NavLink>

            <NavLink href="#matching">
              Career matching
            </NavLink>

            <NavLink href="#roadmap">
              Roadmap
            </NavLink>

            <NavLink href="#ai-guide">
              AI guide
            </NavLink>
          </div>

        {/* AUTH — dynamically shows Log in/Get started or
    Dashboard/Log out depending on whether a Supabase
    session exists. This is the only interactive piece of
    the header; the rest of HomePage stays a Server
    Component since only AuthNavButtons is "use client". */}
<div className="hidden lg:block">
  <AuthNavButtons />
</div>

{/* MOBILE MENU — hamburger toggle, only visible below md,
    giving mobile users access to the nav links (How it works,
    Career matching, Roadmap, AI guide) that are otherwise
    hidden on small screens. */}
<MobileMenu />
        </nav>
      </header>

      {/* ===============================================================
          HERO
      =============================================================== */}

      <section className="relative overflow-hidden">
        {/* -------------------------------------------------------------
            DECORATIVE BACKGROUND

            These shapes make the hero feel less like a blank template.
        ------------------------------------------------------------- */}

        <div
          className="
            pointer-events-none
            absolute
            -right-48
            -top-52
            h-[650px]
            w-[650px]
            rounded-full
            bg-blue-100/60
            blur-3xl
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -left-52
            top-80
            h-[450px]
            w-[450px]
            rounded-full
            bg-indigo-100/40
            blur-3xl
          "
        />

        {/* Grid background */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            opacity-[0.025]
            [background-image:linear-gradient(to_right,#1e3a8a_1px,transparent_1px),linear-gradient(to_bottom,#1e3a8a_1px,transparent_1px)]
            [background-size:40px_40px]
          "
        />

        <div
          className="
            relative
            mx-auto
            grid
            max-w-7xl
            items-center
            gap-14
            px-6
            py-20
            lg:grid-cols-[0.95fr_1.05fr]
            lg:px-8
            lg:py-24
          "
        >
          {/* ===========================================================
              HERO TEXT
          =========================================================== */}

          <div className="relative z-10">
            {/* Badge */}

            <div
              className="
                mb-6
                inline-flex
                items-center
                gap-2
                rounded-full
                bg-white/80
                px-4
                py-2
                text-xs
                font-semibold
                text-brand-accent
                shadow-sm
                backdrop-blur
              "
            >
              <Sparkles size={14} />

              Your skills already tell a story.
            </div>

            {/* Heading */}

            <h1
        className="
          font-heading                max-w-xl
                text-4xl
                font-bold
                leading-[1.07]
                tracking-tight
                text-brand-navy
                sm:text-5xl
                lg:text-[3.7rem]
              "
            >
              Turn your skills into a{" "}
              <span className="relative text-brand-accent">
                direction.

                {/* Underline decoration */}

                <svg
                  viewBox="0 0 240 14"
                  className="
                    absolute
                    -bottom-2
                    left-0
                    w-full
                    text-blue-200
                  "
                  fill="none"
                >
                  <path
                    d="M3 9C62 2 147 2 237 8"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            {/* Description */}

            <p
              className="
                mt-7
                max-w-xl
                text-base
                leading-8
                text-slate-600
                sm:text-lg
              "
            >
              Understand what you&apos;re good at, discover careers that match
              your abilities, see what&apos;s missing, and follow a personalized
              route toward your goal.
            </p>

            {/* CTA */}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/auth/register"
                className="
                  group
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-brand-accent
                  px-6
                  py-3.5
                  text-sm
                  font-semibold
                  text-white
                  shadow-xl
                  shadow-blue-500/20
                  transition-all
                  hover:-translate-y-0.5
                  hover:bg-brand-navy
                "
              >
                Navigate my career

                <Compass size={17} />
              </Link>

              <a
                href="#journey"
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-slate-200
                  bg-white/80
                  px-6
                  py-3.5
                  text-sm
                  font-semibold
                  text-brand-navy
                  backdrop-blur
                  transition
                  hover:border-blue-200
                  hover:text-brand-accent
                "
              >
                Explore the journey

                <ChevronRight size={16} />
              </a>
            </div>

            {/* Quick benefits */}

            <div
              className="
                mt-8
                flex
                flex-wrap
                gap-x-5
                gap-y-3
                text-xs
                font-medium
                text-slate-500
              "
            >
              <QuickBenefit text="Skill based" />
              <QuickBenefit text="Personalized" />
              <QuickBenefit text="Progress aware" />
            </div>
          </div>

          {/* ===========================================================
              HERO VISUAL

              This is intentionally more creative than a plain image.

              It combines:
              - Illustration
              - Navigation route
              - Career match
              - Skill nodes
              - Readiness card
          =========================================================== */}

          <div className="relative mx-auto w-full max-w-[620px]">
            {/* Main visual surface */}

            <div
              className="
                relative
                min-h-[540px]
                overflow-hidden
                rounded-[2.2rem]
                bg-gradient-to-br
                from-[#f5f9ff]
                via-white
                to-[#eef2ff]
                shadow-[0_35px_80px_-30px_rgba(30,58,138,0.35)]
              "
            >
              {/* Giant compass decoration */}

              <Compass
                size={350}
                strokeWidth={0.7}
                className="
                  absolute
                  -right-24
                  -top-20
                  text-blue-100/70
                "
              />

              {/* Small route label */}

              <div
                className="
                  absolute
                  left-6
                  top-6
                  z-30
                  flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-white
                  bg-white/90
                  px-4
                  py-2
                  text-xs
                  font-semibold
                  text-brand-navy
                  shadow-md
                  backdrop-blur
                "
              >
                <Route
                  size={14}
                  className="text-brand-accent"
                />

                Your career route
              </div>

              {/* -------------------------------------------------------
                  CAREER ROUTE SVG

                  A curved path behind the illustration visually
                  reinforces the "Navigator" concept.
              ------------------------------------------------------- */}

              <svg
                viewBox="0 0 600 500"
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  h-full
                  w-full
                "
                fill="none"
              >
                <path
                  d="
                    M70 410
                    C100 300 185 360 220 270
                    C255 180 360 270 390 170
                    C415 95 485 125 535 70
                  "
                  stroke="#BFDBFE"
                  strokeWidth="4"
                  strokeDasharray="9 10"
                  strokeLinecap="round"
                />

                {/* Route checkpoints */}

                <circle
                  cx="70"
                  cy="410"
                  r="8"
                  fill="#2563EB"
                />

                <circle
                  cx="220"
                  cy="270"
                  r="8"
                  fill="#2563EB"
                />

                <circle
                  cx="390"
                  cy="170"
                  r="8"
                  fill="#2563EB"
                />

                <circle
                  cx="535"
                  cy="70"
                  r="10"
                  fill="#34D399"
                />
              </svg>

              {/* -------------------------------------------------------
                  MAIN ILLUSTRATION

                  File location:
                  frontend/public/onboarding-illustration.png
              ------------------------------------------------------- */}

              <div
                className="
                  absolute
                  inset-x-0
                  bottom-12
                  z-10
                  flex
                  justify-center
                  px-16
                "
              >
                <Image
                  src="/onboarding-illustration.png"
                  alt="Person navigating their career path"
                  width={390}
                  height={310}
                  priority
                  className="
                    h-auto
                    w-full
                    max-w-[390px]
                    object-contain
                  "
                />
              </div>

              {/* -------------------------------------------------------
                  SKILL NODE — PYTHON
              ------------------------------------------------------- */}

              <div
                className="
                  absolute
                  left-7
                  top-[32%]
                  z-30
                  flex
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-slate-100
                  bg-white/95
                  px-3
                  py-2.5
                  shadow-lg
                "
              >
                <div
                  className="
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-lg
                    bg-blue-50
                    text-brand-accent
                  "
                >
                  <BrainCircuit size={16} />
                </div>

                <div>
                  <p className="text-[10px] text-slate-400">
                    Strong skill
                  </p>

                  <p className="text-xs font-bold text-brand-navy">
                    Python
                  </p>
                </div>
              </div>

              {/* -------------------------------------------------------
                  DESTINATION NODE
              ------------------------------------------------------- */}

              <div
                className="
                  absolute
                  right-6
                  top-20
                  z-30
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-full
                  bg-emerald-500
                  text-white
                  shadow-lg
                  shadow-emerald-500/25
                "
              >
                <Target size={20} />
              </div>
            </div>

            {/* =========================================================
                FLOATING CAREER MATCH
            ========================================================= */}

            <div
              className="
                absolute
                -bottom-7
                right-1
                z-40
                w-[245px]
                rounded-2xl
                border-slate-200
                bg-white
                p-4
                shadow-2xl
                sm:-right-5
              "
            >
              <div className="flex items-center gap-2">
                <div
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-lg
                    bg-blue-50
                    text-brand-accent
                  "
                >
                  <BriefcaseBusiness size={17} />
                </div>

                <div>
                  <p
                    className="
                      text-[9px]
                      font-bold
                      uppercase
                      tracking-wider
                      text-brand-accent
                    "
                  >
                    Top career match
                  </p>

                  <p className="text-sm font-bold text-brand-navy">
                    Data Analyst
                  </p>
                </div>

                <span
                  className="
                    ml-auto
                    text-lg
                    font-bold
                    text-brand-accent
                  "
                >
                  87%
                </span>
              </div>

              <div
                className="
                  mt-4
                  h-1.5
                  overflow-hidden
                  rounded-full
                  bg-slate-100
                "
              >
                <div
                  className="
                    h-full
                    w-[87%]
                    rounded-full
                    bg-brand-accent
                  "
                />
              </div>
            </div>

            {/* =========================================================
                FLOATING READINESS
            ========================================================= */}

            <div
              className="
                absolute
                -left-3
                bottom-8
                z-40
                hidden
                w-44
                rounded-2xl
                border-slate-200
                bg-white
                p-4
                shadow-xl
                sm:block
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-lg
                    bg-emerald-50
                    text-emerald-600
                  "
                >
                  <TrendingUp size={17} />
                </div>

                <div>
                  <p className="text-[10px] text-slate-400">
                    Readiness
                  </p>

                  <p className="text-lg font-bold text-brand-navy">
                    68%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =============================================================
            HERO BOTTOM — JOURNEY PREVIEW
        ============================================================= */}

        <div
          className="
            relative
            mx-auto
            -mb-10
            mt-4
            max-w-6xl
            px-6
            lg:px-8
          "
        >
          <div
            className="
              grid
              overflow-hidden
              rounded-2xl
              border
              border-slate-200
              bg-white
              shadow-xl
              shadow-slate-900/5
              sm:grid-cols-3
            "
          >
            <JourneyPreview
              icon={<UserRound size={19} />}
              title="Understand yourself"
              text="Profile + assessment"
            />

            <JourneyPreview
              icon={<Compass size={19} />}
              title="Find your direction"
              text="Career matching"
            />

            <JourneyPreview
              icon={<Route size={19} />}
              title="Build your route"
              text="Gap analysis + roadmap"
            />
          </div>
        </div>
      </section>

      {/* ===============================================================
          HOW IT WORKS — CAREER JOURNEY
      =============================================================== */}

      <section
        id="journey"
        className="
          bg-slate-50/70
          px-6
          pb-24
          pt-32
          lg:px-8
        "
      >
        <div className="mx-auto max-w-7xl">
          {/* Heading */}

          <div className="mx-auto max-w-3xl text-center">
            <SectionBadge
              icon={<Map size={14} />}
              text="Your journey"
            />

            <h2
        className="
          font-heading                mt-4
                text-3xl
                font-bold
                tracking-tight
                text-brand-navy
                sm:text-4xl
              "
            >
              One journey. Four meaningful checkpoints.
            </h2>

            <p
              className="
                mx-auto
                mt-5
                max-w-2xl
                leading-7
                text-slate-600
              "
            >
              Each step builds on the last, turning information about you
              into a practical career direction.
            </p>
          </div>

          {/* ===========================================================
              JOURNEY CARDS
          =========================================================== */}

          <div
            className="
              relative
              mt-16
              grid
              gap-5
              md:grid-cols-2
              lg:grid-cols-4
            "
          >
            {/* Connecting route */}

            <div
              className="
                absolute
                left-[10%]
                right-[10%]
                top-10
                hidden
                border-t-2
                border-dashed
                border-blue-200
                lg:block
              "
            />

            <JourneyCard
              number="01"
              icon={<UserRound size={22} />}
              title="Build your profile"
              description="Your education, experience, interests and goals establish your starting point."
            />

            <JourneyCard
              number="02"
              icon={<BrainCircuit size={22} />}
              title="Assess your skills"
              description="Targeted questions help measure what you currently know."
            />

            <JourneyCard
              number="03"
              icon={<Target size={22} />}
              title="Discover matches"
              description="Your assessed abilities are compared with career skill requirements."
            />

            <JourneyCard
              number="04"
              icon={<Route size={22} />}
              title="Follow your route"
              description="Your skill gaps become an ordered learning roadmap."
            />
          </div>
        </div>
      </section>

      {/* ===============================================================
          CAREER MATCHING
      =============================================================== */}

      <section
        id="matching"
        className="
          relative
          overflow-hidden
          bg-brand-navy
          px-6
          py-24
          text-white
          lg:px-8
        "
      >
        {/* Decorative background */}

        <div
          className="
            absolute
            -right-32
            top-0
            h-[500px]
            w-[500px]
            rounded-full
            bg-blue-500/10
            blur-3xl
          "
        />

        <div
          className="
            absolute
            -left-40
            bottom-0
            h-96
            w-96
            rounded-full
            bg-indigo-500/10
            blur-3xl
          "
        />

        <div
          className="
            relative
            mx-auto
            grid
            max-w-7xl
            items-center
            gap-16
            lg:grid-cols-2
          "
        >
          {/* ===========================================================
              MATCHING TEXT
          =========================================================== */}

          <div>
            <SectionBadgeDark
              icon={<Target size={14} />}
              text="Career matching"
            />

            <h2
        className="
          font-heading                mt-5
                max-w-lg
                text-3xl
                font-bold
                leading-tight
                sm:text-4xl
              "
            >
              Find careers where your skills already{" "}
              <span className="text-blue-300">
                belong.
              </span>
            </h2>

            <p
              className="
                mt-5
                max-w-lg
                leading-7
                text-blue-100/70
              "
            >
              See how your assessed skills compare with career requirements,
              understand your strongest matches, and identify the gaps between
              where you are and where you want to go.
            </p>

            {/* Features */}

            <div className="mt-8 space-y-4">
              <DarkFeature
                icon={<BarChart3 size={16} />}
                text="Compatibility scores based on assessed skills"
              />

              <DarkFeature
                icon={<CircleCheck size={16} />}
                text="Your strongest matching skills highlighted"
              />

              <DarkFeature
                icon={<Target size={16} />}
                text="Missing skills identified by required level"
              />

              <DarkFeature
                icon={<TrendingUp size={16} />}
                text="Matches update as your abilities improve"
              />
            </div>
          </div>

          {/* ===========================================================
              CAREER MATCH DASHBOARD
          =========================================================== */}

          <div
            className="
              rounded-[2rem]
              border
              border-white/10
              bg-white/[0.06]
              p-4
              shadow-2xl
              backdrop-blur
              sm:p-6
            "
          >
            {/* Dashboard heading */}

            <div className="flex items-center justify-between px-2 pb-5">
              <div>
                <p className="text-xs text-blue-200/60">
                  Your career matches
                </p>

                <h3 className="mt-1 font-semibold">
                  Based on your assessment
                </h3>
              </div>

              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-blue-400/10
                  text-blue-300
                "
              >
                <Compass size={19} />
              </div>
            </div>

            {/* Career cards */}

            <div className="space-y-3">
              <MatchCard
                icon={<BarChart3 size={19} />}
                title="Data Analyst"
                score={87}
                tags={["Python", "SQL", "Visualization"]}
                best
              />

              <MatchCard
                icon={<BriefcaseBusiness size={19} />}
                title="BI Analyst"
                score={79}
                tags={["SQL", "Analytics", "Communication"]}
              />

              <MatchCard
                icon={<BrainCircuit size={19} />}
                title="Data Scientist"
                score={71}
                tags={["Python", "Statistics", "ML"]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===============================================================
          SKILL GAP VISUAL
      =============================================================== */}

      <section className="px-6 py-24 lg:px-8">
        <div
          className="
            mx-auto
            grid
            max-w-7xl
            items-center
            gap-16
            lg:grid-cols-2
          "
        >
          {/* ===========================================================
              VISUAL GAP ANALYSIS
          =========================================================== */}

          <div
            className="
              rounded-[2rem]
              border
              border-slate-200
              bg-gradient-to-br
              from-white
              to-blue-50/50
              p-6
              shadow-xl
              shadow-slate-900/5
              sm:p-8
            "
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="
                    text-xs
                    font-bold
                    uppercase
                    tracking-wider
                    text-brand-accent
                  "
                >
                  Skill gap analysis
                </p>

                <h3
        className="
          font-heading                    mt-2
                    text-xl
                    font-bold
                    text-brand-navy
                  "
                >
                  Data Analyst
                </h3>
              </div>

              <Target className="text-brand-accent" />
            </div>

            {/* Skill comparisons */}

            <div className="mt-8 space-y-6">
              <SkillGap
                skill="Python"
                current={85}
                required={80}
              />

              <SkillGap
                skill="SQL"
                current={78}
                required={80}
              />

              <SkillGap
                skill="Statistics"
                current={48}
                required={75}
              />

              <SkillGap
                skill="Data Visualization"
                current={62}
                required={70}
              />
            </div>

            {/* Priority */}

            <div
              className="
                mt-8
                flex
                items-center
                gap-4
                rounded-2xl
                border-amber-100
                bg-amber-50
                p-4
              "
            >
              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-amber-100
                  text-amber-700
                "
              >
                <Lightbulb size={19} />
              </div>

              <div>
                <p className="text-xs text-amber-700/70">
                  Highest priority gap
                </p>

                <p
                  className="
                    text-sm
                    font-bold
                    text-amber-900
                  "
                >
                  Statistics
                </p>
              </div>
            </div>
          </div>

          {/* ===========================================================
              GAP TEXT
          =========================================================== */}

          <div>
            <SectionBadge
              icon={<Search size={14} />}
              text="Know what's missing"
            />

            <h2
        className="
          font-heading                mt-5
                text-3xl
                font-bold
                leading-tight
                text-brand-navy
                sm:text-4xl
              "
            >
              Don&apos;t learn everything.
              <span className="block text-brand-accent">
                Learn what matters.
              </span>
            </h2>

            <p
              className="
                mt-5
                max-w-lg
                leading-7
                text-slate-600
              "
            >
              Gap analysis compares your current skill level with what your
              target career requires, helping your roadmap focus on the areas
              with the greatest impact.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <SmallInfoCard
                icon={<Target size={18} />}
                title="Focused"
                text="Prioritize meaningful gaps."
              />

              <SmallInfoCard
                icon={<TrendingUp size={18} />}
                title="Measurable"
                text="See how readiness changes."
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===============================================================
          ROADMAP
      =============================================================== */}

      <section
        id="roadmap"
        className="
          bg-gradient-to-b
          from-slate-50
          to-white
          px-6
          py-24
          lg:px-8
        "
      >
        <div
          className="
            mx-auto
            grid
            max-w-7xl
            items-center
            gap-16
            lg:grid-cols-2
          "
        >
          {/* ===========================================================
              ROADMAP TEXT
          =========================================================== */}

          <div>
            <SectionBadge
              icon={<Route size={14} />}
              text="Your roadmap"
            />

            <h2
        className="
          font-heading                mt-5
                text-3xl
                font-bold
                leading-tight
                text-brand-navy
                sm:text-4xl
              "
            >
              A route built around
              <span className="block text-brand-accent">
                where you are now.
              </span>
            </h2>

            <p
              className="
                mt-5
                max-w-lg
                leading-7
                text-slate-600
              "
            >
              Turn your skill gaps into an ordered learning path. Complete
              steps, track progress, and let your roadmap evolve as your
              abilities improve.
            </p>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <RoadmapBenefit
                icon={<Target size={18} />}
                title="Gap focused"
                text="Work on skills that move you closer to your goal."
              />

              <RoadmapBenefit
                icon={<CircleCheck size={18} />}
                title="Progress aware"
                text="Completed steps stay out of your way."
              />

              <RoadmapBenefit
                icon={<TrendingUp size={18} />}
                title="Adaptive"
                text="Readiness updates as you improve."
              />

              <RoadmapBenefit
                icon={<GraduationCap size={18} />}
                title="Learning driven"
                text="Turn gaps into practical learning steps."
              />
            </div>
          </div>

          {/* ===========================================================
              ROADMAP VISUAL
          =========================================================== */}

          <div
            className="
              relative
              rounded-[2rem]
              border
              border-slate-200
              bg-white
              p-6
              shadow-2xl
              shadow-slate-900/5
              sm:p-8
            "
          >
            {/* Header */}

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">
                  Learning route
                </p>

                <h3
        className="
          font-heading                    mt-1
                    text-lg
                    font-bold
                    text-brand-navy
                  "
                >
                  Path to Data Analyst
                </h3>
              </div>

              <div
                className="
                  rounded-xl
                  bg-blue-50
                  px-3
                  py-2
                  text-xs
                  font-bold
                  text-brand-accent
                "
              >
                68% ready
              </div>
            </div>

            {/* Overall progress */}

            <div
              className="
                mt-6
                h-2
                overflow-hidden
                rounded-full
                bg-slate-100
              "
            >
              <div
                className="
                  h-full
                  w-[68%]
                  rounded-full
                  bg-gradient-to-r
                  from-brand-accent
                  to-blue-400
                "
              />
            </div>

            {/* Timeline */}

            <div className="relative mt-8">
              {/* Vertical route */}

              <div
                className="
                  absolute
                  bottom-8
                  left-[19px]
                  top-8
                  w-0.5
                  bg-blue-100
                "
              />

              <RoadmapStep
                icon={<Check size={15} />}
                title="SQL Fundamentals"
                text="Core querying and database concepts"
                status="Completed"
                completed
              />

              <RoadmapStep
                icon={<BrainCircuit size={15} />}
                title="Data Cleaning with Python"
                text="Prepare and transform datasets"
                status="In progress"
                active
              />

              <RoadmapStep
                icon={<BarChart3 size={15} />}
                title="Statistics for Analysis"
                text="Build statistical reasoning"
                status="Next"
              />

              <RoadmapStep
                icon={<TrendingUp size={15} />}
                title="Data Visualization"
                text="Communicate insights clearly"
                status="Upcoming"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===============================================================
          AI CAREER GUIDE
      =============================================================== */}

      <section
        id="ai-guide"
        className="px-6 py-24 lg:px-8"
      >
        <div
          className="
            mx-auto
            grid
            max-w-7xl
            items-center
            gap-16
            lg:grid-cols-2
          "
        >
          {/* ===========================================================
              CHAT VISUAL
          =========================================================== */}

          <div
            className="
              overflow-hidden
              rounded-[2rem]
              border
              border-slate-200
              bg-white
              shadow-2xl
              shadow-slate-900/5
            "
          >
            {/* Chat header */}

            <div
              className="
                flex
                items-center
                gap-3
                border-b
                border-slate-100
                px-6
                py-5
              "
            >
              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-gradient-to-br
                  from-brand-accent
                  to-indigo-600
                  text-white
                  shadow-md
                "
              >
                <Bot size={20} />
              </div>

              <div>
                <p
                  className="
                    text-sm
                    font-bold
                    text-brand-navy
                  "
                >
                  Career Guide
                </p>

                <p
                  className="
                    flex
                    items-center
                    gap-1.5
                    text-[11px]
                    text-emerald-600
                  "
                >
                  <span
                    className="
                      h-1.5
                      w-1.5
                      rounded-full
                      bg-emerald-500
                    "
                  />

                  Grounded in your profile
                </p>
              </div>

              <Sparkles
                size={17}
                className="ml-auto text-brand-accent"
              />
            </div>

            {/* Messages */}

            <div className="space-y-5 bg-slate-50/60 p-6">
              {/* User */}

              <div className="flex justify-end">
                <div
                  className="
                    max-w-[82%]
                    rounded-2xl
                    rounded-br-sm
                    bg-brand-accent
                    px-4
                    py-3
                    text-sm
                    leading-6
                    text-white
                    shadow-md
                  "
                >
                  Why is Data Analyst my strongest match?
                </div>
              </div>

              {/* AI */}

              <div className="flex items-start gap-3">
                <div
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-blue-100
                    text-brand-accent
                  "
                >
                  <Bot size={15} />
                </div>

                <div
                  className="
                    max-w-[82%]
                    rounded-2xl
                    rounded-tl-sm
                    border
                    border-slate-100
                    bg-white
                    px-4
                    py-3
                    text-sm
                    leading-6
                    text-slate-600
                    shadow-sm
                  "
                >
                  Your assessed Python and SQL skills already align strongly
                  with this career. Your largest current gap is Statistics,
                  so I&apos;ve prioritized it in your roadmap.
                </div>
              </div>

              {/* Suggested questions */}

              <div className="flex flex-wrap gap-2 pl-11">
                <Suggestion text="What should I learn next?" />
                <Suggestion text="Explain my skill gaps" />
              </div>

              {/* Input */}

              <div
                className="
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-4
                  py-3
                "
              >
                <MessageCircle
                  size={17}
                  className="text-slate-400"
                />

                <span
                  className="
                    flex-1
                    text-sm
                    text-slate-400
                  "
                >
                  Ask about your career path...
                </span>

                <div
                  className="
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-lg
                    bg-brand-accent
                    text-white
                  "
                >
                  <ArrowRight size={15} />
                </div>
              </div>
            </div>
          </div>

          {/* ===========================================================
              AI TEXT
          =========================================================== */}

          <div>
            <SectionBadge
              icon={<WandSparkles size={14} />}
              text="AI career guide"
            />

            <h2
        className="
          font-heading                mt-5
                text-3xl
                font-bold
                leading-tight
                text-brand-navy
                sm:text-4xl
              "
            >
              Advice that knows
              <span className="block text-brand-accent">
                where you&apos;re going.
              </span>
            </h2>

            <p
              className="
                mt-5
                max-w-lg
                leading-7
                text-slate-600
              "
            >
              Ask questions about your career matches, skill gaps, or learning
              roadmap and receive guidance grounded in your own profile and
              progress.
            </p>

            <div
              className="
                mt-8
                rounded-2xl
                bg-blue-50/60
                p-5
              "
            >
              <div className="flex gap-4">
                <div
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-white
                    text-brand-accent
                    shadow-sm
                  "
                >
                  <Sparkles size={18} />
                </div>

                <div>
                  <p
                    className="
                      text-sm
                      font-bold
                      text-brand-navy
                    "
                  >
                    Context matters.
                  </p>

                  <p
                    className="
                      mt-1
                      text-sm
                      leading-6
                      text-slate-500
                    "
                  >
                    Your career guide works with your actual profile, results,
                    gaps and roadmap instead of giving generic advice.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===============================================================
          FINAL CTA
      =============================================================== */}

      <section className="px-6 pb-24 lg:px-8">
        <div
          className="
            relative
            mx-auto
            max-w-7xl
            overflow-hidden
            rounded-[2.5rem]
            bg-gradient-to-br
            from-brand-accent
            via-blue-700
            to-brand-navy
            px-8
            py-16
            text-center
            text-white
            sm:px-12
            lg:py-20
          "
        >
          {/* Decorative giant icons */}

          <Compass
            size={270}
            strokeWidth={0.5}
            className="
              absolute
              -right-16
              -top-20
              text-white/10
            "
          />

          <Route
            size={230}
            strokeWidth={0.5}
            className="
              absolute
              -bottom-20
              -left-14
              rotate-12
              text-white/10
            "
          />

          <div className="relative mx-auto max-w-2xl">
            <div
              className="
                mx-auto
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                bg-white/10
                backdrop-blur
              "
            >
              <Compass size={27} />
            </div>

            <h2
        className="
          font-heading                mt-6
                text-3xl
                font-bold
                tracking-tight
                sm:text-4xl
              "
            >
              Ready to find your direction?
            </h2>

            <p
              className="
                mx-auto
                mt-5
                max-w-xl
                leading-7
                text-blue-100/80
              "
            >
              Start with the skills you already have and turn them into a
              clear, personalized path forward.
            </p>

            <div
              className="
                mt-8
                flex
                flex-col
                justify-center
                gap-3
                sm:flex-row
              "
            >
              <Link
                href="/auth/register"
                className="
                  group
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-white
                  px-7
                  py-3.5
                  text-sm
                  font-semibold
                  text-brand-navy
                  shadow-lg
                  transition-all
                  hover:-translate-y-0.5
                  hover:bg-blue-50
                "
              >
                Create your account

                <ArrowRight
                  size={16}
                  className="
                    transition-transform
                    group-hover:translate-x-1
                  "
                />
              </Link>

              <Link
                href="/auth/login"
                className="
                  inline-flex
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-white/20
                  bg-white/5
                  px-7
                  py-3.5
                  text-sm
                  font-semibold
                  text-white
                  backdrop-blur
                  transition
                  hover:bg-white/10
                "
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===============================================================
          FOOTER
      =============================================================== */}

      <footer
        className="
          border-t
          border-slate-100
          bg-slate-50/50
        "
      >
        <div
          className="
            mx-auto
            flex
            max-w-7xl
            flex-col
            items-center
            justify-between
            gap-6
            px-6
            py-10
            sm:flex-row
            lg:px-8
          "
        >
          <Link
            href="/"
            className="flex items-center gap-2.5"
          >
            <Image
              src="/logo-icon.png"
              alt="AI Career Navigator"
              width={29}
              height={29}
            />

            <span
              className="
                text-sm
                font-bold
                text-brand-navy
              "
            >
              AI{" "}
              <span className="text-brand-accent">
                Career Navigator
              </span>
            </span>
          </Link>

          <div
            className="
              flex
              flex-wrap
              justify-center
              gap-6
            "
          >
            <a
              href="#journey"
              className="
                text-xs
                text-slate-500
                transition
                hover:text-brand-accent
              "
            >
              How it works
            </a>

            <a
              href="#matching"
              className="
                text-xs
                text-slate-500
                transition
                hover:text-brand-accent
              "
            >
              Career matching
            </a>

            <a
              href="#roadmap"
              className="
                text-xs
                text-slate-500
                transition
                hover:text-brand-accent
              "
            >
              Roadmap
            </a>

            <a
              href="#ai-guide"
              className="
                text-xs
                text-slate-500
                transition
                hover:text-brand-accent
              "
            >
              AI guide
            </a>
          </div>

          <p className="text-xs text-slate-400">
            Map your skills. Navigate your career.
          </p>
        </div>
      </footer>
    </main>
  );
}

/**
 * =====================================================================
 * NAV LINK
 * =====================================================================
 */

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    
    <a
      href={href}
      className="
        text-sm
        font-medium
        text-slate-600
        transition-colors
        hover:text-brand-accent
      "
    >
      {children}
    </a>
  );
}

/**
 * =====================================================================
 * QUICK BENEFIT
 * =====================================================================
 */

function QuickBenefit({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="
          flex
          h-5
          w-5
          items-center
          justify-center
          rounded-full
          bg-emerald-50
          text-emerald-600
        "
      >
        <Check size={11} strokeWidth={3} />
      </span>

      {text}
    </div>
  );
}

/**
 * =====================================================================
 * SECTION BADGE
 * =====================================================================
 */

function SectionBadge({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div
      className="
        inline-flex
        items-center
        gap-2
        rounded-full
        border
        border-blue-100
        bg-blue-50
        px-3
        py-1.5
        text-xs
        font-bold
        uppercase
        tracking-wider
        text-brand-accent
      "
    >
      {icon}
      {text}
    </div>
  );
}

/**
 * =====================================================================
 * DARK SECTION BADGE
 * =====================================================================
 */

function SectionBadgeDark({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div
      className="
        inline-flex
        items-center
        gap-2
        rounded-full
        border
        border-blue-300/15
        bg-blue-400/10
        px-3
        py-1.5
        text-xs
        font-bold
        uppercase
        tracking-wider
        text-blue-300
      "
    >
      {icon}
      {text}
    </div>
  );
}

/**
 * =====================================================================
 * HERO JOURNEY PREVIEW
 * =====================================================================
 */

function JourneyPreview({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-4
        border-b
        border-slate-100
        p-5
        last:border-0
        sm:border-b-0
        sm:border-r
        sm:last:border-r-0
      "
    >
      <div
        className="
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-xl
          bg-blue-50
          text-brand-accent
        "
      >
        {icon}
      </div>

      <div>
        <p
          className="
            text-sm
            font-bold
            text-brand-navy
          "
        >
          {title}
        </p>

        <p className="mt-0.5 text-xs text-slate-400">
          {text}
        </p>
      </div>
    </div>
  );
}

/**
 * =====================================================================
 * JOURNEY CARD
 * =====================================================================
 */

function JourneyCard({
  number,
  icon,
  title,
  description,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div
      className="
        group
        relative
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-6
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-blue-200
        hover:shadow-xl
        hover:shadow-blue-950/5
      "
    >
      {/* Icon checkpoint */}

      <div
        className="
          relative
          z-10
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-2xl
          bg-blue-50
          text-brand-accent
          ring-8
          ring-slate-50
          transition-all
          group-hover:bg-brand-accent
          group-hover:text-white
        "
      >
        {icon}
      </div>

      <p
        className="
          mt-7
          text-[10px]
          font-bold
          uppercase
          tracking-[0.16em]
          text-brand-accent
        "
      >
        Checkpoint {number}
      </p>

      <h3
        className="
          font-heading          mt-2
          text-base
          font-bold
          text-brand-navy
        "
      >
        {title}
      </h3>

      <p
        className="
          mt-2
          text-sm
          leading-6
          text-slate-500
        "
      >
        {description}
      </p>
    </div>
  );
}

/**
 * =====================================================================
 * DARK FEATURE
 * =====================================================================
 */

function DarkFeature({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-lg
          bg-blue-400/10
          text-blue-300
        "
      >
        {icon}
      </div>

      <span className="text-sm text-blue-50/90">
        {text}
      </span>
    </div>
  );
}

/**
 * =====================================================================
 * CAREER MATCH CARD
 * =====================================================================
 */

function MatchCard({
  icon,
  title,
  score,
  tags,
  best = false,
}: {
  icon: React.ReactNode;
  title: string;
  score: number;
  tags: string[];
  best?: boolean;
}) {
  return (
    <div
      className={`
        rounded-2xl
        border
        p-5
        transition-all
        ${
          best
            ? "border-blue-400/30 bg-blue-400/10"
            : "border-white/10 bg-white/[0.04]"
        }
      `}
    >
      <div className="flex items-center gap-4">
        {/* Career icon */}

        <div
          className="
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-white/10
            text-blue-300
          "
        >
          {icon}
        </div>

        {/* Career info */}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white">
              {title}
            </h3>

            {best && (
              <span
                className="
                  rounded-full
                  bg-blue-400/15
                  px-2
                  py-0.5
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-wider
                  text-blue-300
                "
              >
                Best match
              </span>
            )}
          </div>

          {/* Skill tags */}

          <div className="mt-2 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="
                  rounded-md
                  bg-white/[0.06]
                  px-2
                  py-1
                  text-[9px]
                  text-blue-100/60
                "
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Score */}

        <span
          className="
            text-xl
            font-bold
            text-blue-300
          "
        >
          {score}%
        </span>
      </div>

      {/* Progress */}

      <div
        className="
          mt-4
          h-1
          overflow-hidden
          rounded-full
          bg-white/10
        "
      >
        <div
          className="
            h-full
            rounded-full
            bg-blue-400
          "
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

/**
 * =====================================================================
 * SKILL GAP
 * =====================================================================
 *
 * Shows:
 * - current skill level
 * - required career level
 */

function SkillGap({
  skill,
  current,
  required,
}: {
  skill: string;
  current: number;
  required: number;
}) {
  return (
    <div>
      <div
        className="
          mb-2
          flex
          items-center
          justify-between
        "
      >
        <span
          className="
            text-sm
            font-semibold
            text-brand-navy
          "
        >
          {skill}
        </span>

        <div className="flex gap-3 text-[10px]">
          <span className="text-brand-accent">
            You {current}%
          </span>

          <span className="text-slate-400">
            Target {required}%
          </span>
        </div>
      </div>

      {/* Current skill */}

      <div
        className="
          relative
          h-2
          overflow-hidden
          rounded-full
          bg-slate-100
        "
      >
        {/* Required marker */}

        <div
          className="
            absolute
            bottom-0
            top-0
            z-10
            w-0.5
            bg-brand-navy
          "
          style={{ left: `${required}%` }}
        />

        {/* Current progress */}

        <div
          className="
            h-full
            rounded-full
            bg-gradient-to-r
            from-blue-400
            to-brand-accent
          "
          style={{ width: `${current}%` }}
        />
      </div>
    </div>
  );
}

/**
 * =====================================================================
 * SMALL INFO CARD
 * =====================================================================
 */

function SmallInfoCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div
      className="
        rounded-xl
        border
        border-slate-200
        bg-white
        p-4
      "
    >
      <div className="text-brand-accent">
        {icon}
      </div>

      <p
        className="
          mt-3
          text-sm
          font-bold
          text-brand-navy
        "
      >
        {title}
      </p>

      <p
        className="
          mt-1
          text-xs
          leading-5
          text-slate-500
        "
      >
        {text}
      </p>
    </div>
  );
}

/**
 * =====================================================================
 * ROADMAP BENEFIT
 * =====================================================================
 */

function RoadmapBenefit({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-3">
      <div
        className="
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-lg
          bg-blue-50
          text-brand-accent
        "
      >
        {icon}
      </div>

      <div>
        <p
          className="
            text-sm
            font-bold
            text-brand-navy
          "
        >
          {title}
        </p>

        <p
          className="
            mt-1
            text-xs
            leading-5
            text-slate-500
          "
        >
          {text}
        </p>
      </div>
    </div>
  );
}

/**
 * =====================================================================
 * ROADMAP STEP
 * =====================================================================
 */

function RoadmapStep({
  icon,
  title,
  text,
  status,
  completed = false,
  active = false,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  status: string;
  completed?: boolean;
  active?: boolean;
}) {
  return (
    <div
      className="
        relative
        z-10
        mb-3
        flex
        items-center
        gap-4
        rounded-xl
        border
        border-slate-100
        bg-white
        p-4
        last:mb-0
      "
    >
      <div
        className={`
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-full
          ${
            completed
              ? "bg-emerald-500 text-white"
              : active
              ? "bg-brand-accent text-white"
              : "bg-blue-50 text-brand-accent"
          }
        `}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p
          className="
            text-sm
            font-semibold
            text-brand-navy
          "
        >
          {title}
        </p>

        <p className="mt-0.5 text-xs text-slate-400">
          {text}
        </p>
      </div>

      <span
        className={`
          hidden
          text-[10px]
          font-semibold
          sm:block
          ${
            completed
              ? "text-emerald-600"
              : active
              ? "text-brand-accent"
              : "text-slate-400"
          }
        `}
      >
        {status}
      </span>
    </div>
  );
}

/**
 * =====================================================================
 * CHAT SUGGESTION
 * =====================================================================
 */

function Suggestion({
  text,
}: {
  text: string;
}) {
  return (
    <span
      className="
        rounded-full
        border
        border-blue-100
        bg-white
        px-3
        py-1.5
        text-[10px]
        font-medium
        text-brand-accent
      "
    >
      {text}
    </span>
  );
}