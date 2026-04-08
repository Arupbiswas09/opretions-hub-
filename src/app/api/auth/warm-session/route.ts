import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../lib/supabase/server';
import { getSupabaseAdmin, isSupabaseAdminConfigured } from '../../../lib/supabase/admin';
import { cacheUserSession } from '../../../lib/auth/session-cache';
import { hubDevBypassContext } from '../../../lib/hub/dev-bypass';

/** Warm Redis session cache after login (Node runtime — ioredis). */
export async function POST() {
  try {
    if (hubDevBypassContext()) {
      return NextResponse.json({ ok: true, cached: false, bypass: true });
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ ok: true, cached: false });
    }

    const admin = getSupabaseAdmin();
    const { data: profile } = await admin
      .from('profiles')
      .select('org_id, role, display_name, avatar_url')
      .eq('id', user.id)
      .maybeSingle();

    let orgName: string | null = null;
    if (profile?.org_id) {
      const { data: orgRow } = await admin.from('organizations').select('name').eq('id', profile.org_id).maybeSingle();
      orgName = orgRow?.name ?? null;
    }

    await cacheUserSession({
      userId: user.id,
      email: user.email ?? null,
      role: (profile?.role as string) || 'member',
      displayName: profile?.display_name ?? null,
      avatarUrl: profile?.avatar_url ?? null,
      orgId: profile?.org_id ?? null,
      orgName,
    });

    return NextResponse.json({ ok: true, cached: true });
  } catch (e) {
    console.error('[auth/warm-session]', e);
    return NextResponse.json({ ok: true, cached: false });
  }
}
