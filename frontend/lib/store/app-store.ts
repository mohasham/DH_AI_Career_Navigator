import { create } from "zustand";
import { apiGet } from "@/lib/api/client";

/**
 * =====================================================================
 * SHARED APP STORE (Zustand) — the one place server data is kept
 * =====================================================================
 *
 * FILE:
 * frontend/lib/store/app-store.ts
 *
 * ---------------------------------------------------------------------
 * THE PROBLEM THIS SOLVES
 * ---------------------------------------------------------------------
 * Before this store, every component that needed the user's dashboard
 * summary or skill levels fetched it ITSELF and kept its own copy in
 * useState:
 *
 *   - (app)/layout.tsx   fetched GET /dashboard/summary  (twice!)
 *   - (app)/layout.tsx   fetched GET /skills/my-levels   (every navigation)
 *   - dashboard/page.tsx fetched GET /dashboard/summary  (again)
 *
 * So just opening /dashboard made TWO identical requests to the same
 * endpoint at the same moment. Besides wasting network and backend
 * work (and our Render free tier can already be slow to wake up), it
 * created a correctness risk: two components each holding their OWN
 * copy of the "same" data can disagree — one shows the updated value,
 * the other still shows the old one — and each page flashed a loading
 * spinner every time you navigated to it, even though we had just
 * loaded that data a second ago.
 *
 * ---------------------------------------------------------------------
 * WHAT THE STORE DOES
 * ---------------------------------------------------------------------
 * 1. ONE COPY. The summary and the skill levels live here, once.
 *    Every component reads the same object, so they cannot disagree.
 *
 * 2. DEDUPED REQUESTS. If two components ask for the same data at the
 *    same moment (layout + dashboard on first load), they share ONE
 *    in-flight request instead of firing two.
 *
 * 3. INSTANT NAVIGATION. Data already loaded is shown immediately when
 *    you come back to a page — no spinner flash. Pages that need fresh
 *    data still re-validate in the background (see "stale-while-
 *    revalidate" below).
 *
 * 4. SAFE ON LOGOUT. reset() wipes everything, so the next person to
 *    log in on the same browser can never see the previous user's data.
 *
 * ---------------------------------------------------------------------
 * WHY ZUSTAND (AND NOT THE ALTERNATIVES)
 * ---------------------------------------------------------------------
 * - useState everywhere: that is the problem above — each component
 *   gets its own private copy and its own fetch.
 * - React Context: works, but every consumer re-renders whenever ANY
 *   value in the context changes, and you need a Provider, reducer
 *   boilerplate and a custom hook per context. Too heavy for this.
 * - Redux Toolkit: powerful, but a lot of ceremony (slices, actions,
 *   Provider) for two pieces of shared data.
 * - SWR / React Query: purpose-built for server data and a good
 *   choice too. Zustand was picked because the app only has a couple
 *   of shared fetches, it is tiny (no Provider, a few lines), and I
 *   wanted full control over WHEN data is invalidated (after a quiz,
 *   after saving skills, on logout).
 * Zustand gives a global store with no Provider and fine-grained
 * subscriptions: a component using `useAppStore((s) => s.summary)`
 * re-renders ONLY when the summary changes, not when anything else in
 * the store does.
 *
 * ---------------------------------------------------------------------
 * WHAT GOES IN THE STORE — AND WHAT DOES NOT
 * ---------------------------------------------------------------------
 * IN the store: SERVER data that several pages share (dashboard
 * summary, skill levels).
 * STAYS in useState: purely local UI state — form inputs, the mobile
 * menu toggle, the current quiz question, one page's loading flag.
 * Putting local state in a global store would only make the app harder
 * to reason about.
 *
 * ---------------------------------------------------------------------
 * STALE-WHILE-REVALIDATE — HOW WE STAY CORRECT
 * ---------------------------------------------------------------------
 * A cache is only useful if it is not WRONG. Rule used here:
 *   loadX()              -> return the cached value if we have one
 *                           (cheap; used where slightly old is fine).
 *   loadX({ force:true }) -> always ask the server, and update the
 *                           store when the answer arrives (used where
 *                           the data must be current, e.g. the
 *                           onboarding gate and the dashboard).
 * The dashboard shows the cached summary instantly and refreshes it in
 * the background, so it is both fast AND correct.
 *
 * ---------------------------------------------------------------------
 * RACE-CONDITION GUARD ("generation")
 * ---------------------------------------------------------------------
 * Imagine a request is still in flight when the user logs out. When it
 * finally returns it must NOT write the old user's data into the store
 * that now belongs to the next login. Every reset() bumps `generation`;
 * a response only writes to the store if the generation is unchanged
 * since the request started.
 *
 * ---------------------------------------------------------------------
 * PHASE 1 SCOPE
 * ---------------------------------------------------------------------
 * Phase 1 uses this store from the shared layout and the dashboard.
 * The remaining pages (chat, assessment picker, edit profile, the quiz
 * page) still fetch on their own and will be moved over in Phase 2 —
 * until then the layout's onboarding gate deliberately uses
 * { force: true } for skill levels, so it never makes a decision from
 * a copy that a not-yet-migrated page could have made stale.
 * =====================================================================
 */

// -------------------------------------------------------------------
// TYPES
// -------------------------------------------------------------------

export type DashboardOpportunity = {
  skill_name: string;
  current_level: number;
  required_level: number;
  gap: number;
};

// Shape returned by GET /dashboard/summary. `career_id` is present
// when the user has a roadmap (the layout uses it for the sidebar's
// Gap Analysis / Roadmap links).
export type DashboardSummary = {
  has_roadmap: boolean;
  career_id?: number;
  target_career: string | null;
  readiness_percentage: number;
  steps_completed: number;
  steps_total: number;
  opportunities: DashboardOpportunity[];
  current_step_title: string | null;
};

// Shape of each entry in GET /skills/my-levels (only the fields the
// app currently reads). `source` is null if the user never selected
// the skill, otherwise "selected" | "tested" | "practiced".
export type SkillLevel = {
  skill_name: string;
  source: string | null;
};

type LoadOptions = {
  // true = ignore the cached value and ask the server again.
  force?: boolean;
};

type AppState = {
  // null = "not loaded yet" (different from "loaded and empty").
  summary: DashboardSummary | null;
  levels: SkillLevel[] | null;

  // Both loaders RESOLVE with the data and REJECT on a network/API
  // error — each caller decides what an error means for its page
  // (the layout gate sends the user to /onboarding, the dashboard
  // simply shows its empty state).
  loadSummary: (options?: LoadOptions) => Promise<DashboardSummary>;
  loadLevels: (options?: LoadOptions) => Promise<SkillLevel[]>;

  // Wipes all cached data. Call on logout.
  reset: () => void;
};

// -------------------------------------------------------------------
// MODULE-LEVEL BOOKKEEPING (not part of React state on purpose —
// changing these must not trigger any re-render)
// -------------------------------------------------------------------

// Bumped on every reset(); lets late responses know they are stale.
let generation = 0;

// The currently running request for each endpoint, if any. Callers
// that arrive while one is running share it instead of starting a
// duplicate.
let summaryRequest: Promise<DashboardSummary> | null = null;
let levelsRequest: Promise<SkillLevel[]> | null = null;

// -------------------------------------------------------------------
// THE STORE
// -------------------------------------------------------------------

export const useAppStore = create<AppState>((set, get) => ({
  summary: null,
  levels: null,

  loadSummary: async ({ force = false } = {}) => {
    // Cached and not forced -> no network at all.
    const cached = get().summary;
    if (cached && !force) return cached;

    // Someone is already fetching this -> share their request.
    if (summaryRequest) return summaryRequest;

    const startedInGeneration = generation;

    const request: Promise<DashboardSummary> = apiGet<DashboardSummary>(
      "/dashboard/summary"
    )
      .then((data) => {
        // Only write if no logout/reset happened while we waited.
        if (startedInGeneration === generation) {
          set({ summary: data });
        }
        return data;
      })
      .finally(() => {
        // Clear the "in flight" marker, but only if it is still OURS
        // (a reset() may already have replaced it).
        if (summaryRequest === request) summaryRequest = null;
      });

    summaryRequest = request;
    return request;
  },

  loadLevels: async ({ force = false } = {}) => {
    const cached = get().levels;
    if (cached && !force) return cached;

    if (levelsRequest) return levelsRequest;

    const startedInGeneration = generation;

    const request: Promise<SkillLevel[]> = apiGet<{ skills: SkillLevel[] }>(
      "/skills/my-levels"
    )
      .then((data) => {
        if (startedInGeneration === generation) {
          set({ levels: data.skills });
        }
        return data.skills;
      })
      .finally(() => {
        if (levelsRequest === request) levelsRequest = null;
      });

    levelsRequest = request;
    return request;
  },

  reset: () => {
    generation += 1;
    summaryRequest = null;
    levelsRequest = null;
    set({ summary: null, levels: null });
  },
}));
