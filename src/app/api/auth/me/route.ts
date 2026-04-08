import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../lib/supabase/server';
import { getSupabaseAdmin, isSupabaseAdminConfigured } from '../../../lib/supabase/admin';
import { hubDevBypassContext } from '../../../lib/hub/dev-bypass';

export async function GET() {
  try {
    const bypass = hubDevBypassContext();
    if (bypass && isSupabaseAdminConfigured()) {
      const admin = getSupabaseAdmin();
      const { data: profile } = await admin
        .from('profiles')
        .select('id, org_id, role, display_name, avatar_url')
        .eq('id', bypass.userId)
        .maybeSingle();
      let org: { name: string } | null = null;
      const orgId = profile?.org_id ?? bypass.orgId;
      if (orgId) {
        const { data: orgRow } = await admin.from('organizations').select('name').eq('id', orgId).maybeSingle();
        if (orgRow) org = { name: orgRow.name };
      }
      return NextResponse.json({
        user: { id: bypass.userId, email: 'dev@bypass.local' },
        profile: profile
          ? {
              id: profile.id,
              org_id: profile.org_id,
              role: profile.role,
              display_name: profile.display_name,
              avatar_url: profile.avatar_url,
            }
          : {
              id: bypass.userId,
              org_id: bypass.orgId,
              role: 'admin',
              display_name: 'Dev bypass',
              avatar_url: null,
            },
        organization: org,
        bypass: true,
      });
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
      return NextResponse.json({
        user: { id: user.id, email: user.email },
        profile: null,
        organization: null,
      });
    }

    const admin = getSupabaseAdmin();
    const { data: profile, error: pErr } = await admin
      .from('profiles')
      .select('id, org_id, role, display_name, avatar_url')
      .eq('id', user.id)
      .maybeSingle();

    if (pErr) {
      console.error('[auth/me] profile', pErr);
      return NextResponse.json({ error: 'Profile load failed' }, { status: 500 });
    }

    let org: { name: string } | null = null;
    if (profile?.org_id) {
      const { data: orgRow } = await admin.from('organizations').select('name').eq('id', profile.org_id).maybeSingle();
      if (orgRow) org = { name: orgRow.name };
    }

    return NextResponse.json({
      user: { id: user.id, email: user.email },
      profile: profile
        ? {
            id: profile.id,
            org_id: profile.org_id,
            role: profile.role,
            display_name: profile.display_name,
            avatar_url: profile.avatar_url,
          }
        : null,
      organization: org,
    });
  } catch (e) {
    console.error('[auth/me]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
