import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../lib/supabase/server';
import { getSupabaseAdmin, isSupabaseAdminConfigured } from '../../../lib/supabase/admin';
import { clearUserSession } from '../../../lib/auth/session-cache';

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 503 });
    }

    const body = (await request.json()) as { display_name?: string; avatar_url?: string };
    const patch: Record<string, string> = {};
    if (typeof body.display_name === 'string') patch.display_name = body.display_name.slice(0, 200);
    if (typeof body.avatar_url === 'string') patch.avatar_url = body.avatar_url.slice(0, 2000);

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: 'No valid fields' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from('profiles')
      .update(patch)
      .eq('id', user.id)
      .select('id, display_name, avatar_url, role, org_id')
      .single();

    if (error) {
      console.error('[auth/profile]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await clearUserSession(user.id);

    return NextResponse.json({ ok: true, profile: data });
  } catch (e) {
    console.error('[auth/profile]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
