/**
 * Browser-side Supabase client.
 *
 * WHY THIS FILE EXISTS:
 * Every page/component that needs to call Supabase Auth (sign up, sign in,
 * sign out, get the current session) needs a configured client instance.
 * Instead of creating a new client in every file, we create ONE here and
 * import it everywhere — this avoids duplicate connections and keeps
 * configuration in a single place.
 *
 * WHICH KEY THIS USES:
 * This uses the PUBLIC anon key (NEXT_PUBLIC_SUPABASE_ANON_KEY), which is
 * safe to expose in the browser. It only allows actions a normal user is
 * permitted to do, and Supabase's Row Level Security (RLS) policies —
 * the ones we wrote in the migration file — enforce what that actually
 * means per table. This is NOT the service_role key; that one only ever
 * lives in the backend's .env and is never imported here.
 */

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}