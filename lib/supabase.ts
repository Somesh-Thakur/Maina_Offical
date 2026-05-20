import { createClient, SupabaseClient } from '@supabase/supabase-js';

/** Client-side Supabase client (uses anon key, respects RLS).
 *  Created lazily so import-time builds don't crash when env vars are absent.
 */
let _client: SupabaseClient | null = null;
export function getSupabase(): SupabaseClient {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }
  return _client;
}

/** Backwards-compat named export so existing code can still `import { supabase }` */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop: string) {
    return (getSupabase() as any)[prop];
  },
});

/** Server-side admin client (uses service role, bypasses RLS).
 *  Always creates a fresh instance (per-request) for safety.
 */
export function getSupabaseAdmin(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
