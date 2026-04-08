import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Block mutations for DB role `viewer` (Phase 1 + Phase 5). */
export async function assertNotViewer(
  admin: SupabaseClient,
  userId: string
): Promise<NextResponse | null> {
  const { data } = await admin.from('profiles').select('role').eq('id', userId).maybeSingle();
  if (data?.role === 'viewer') {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }
  return null;
}
