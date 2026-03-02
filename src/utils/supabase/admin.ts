import { createClient } from '@supabase/supabase-js';

/**
 * Admin 클라이언트 - Service Role Key 사용
 * Auth Admin API (deleteUser 등) 및 RLS 우회 필요 시에만 사용
 * 절대 클라이언트에 노출하지 말 것
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY for admin operations');
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
