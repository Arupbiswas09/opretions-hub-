import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../supabase/server';
import { getSupabaseAdmin, isSupabaseAdminConfigured } from '../supabase/admin';
import { hubDevBypassContext } from './dev-bypass';

export type HubOrgContext = { userId: string; orgId: string };

/** Resolve signed-in user and their org from profiles (service role). */
export async function getHubOrgOr401(): Promise<HubOrgContext | NextResponse> {
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 503 });
  }

  const bypass = hubDevBypassContext();
  if (bypass) return bypass;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = getSupabaseAdmin();
  const { data: profile, error: pErr } = await admin
    .from('profiles')
    .select('org_id')
    .eq('id', user.id)
    .maybeSingle();

  if (pErr || !profile?.org_id) {
    return NextResponse.json({ error: 'No organization for user' }, { status: 403 });
  }

  return { userId: user.id, orgId: profile.org_id };
}
