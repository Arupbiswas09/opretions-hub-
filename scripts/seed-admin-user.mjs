/**
 * Create or repair a test admin user in Supabase Auth + profiles.
 * Uses the Auth Admin API (same as Dashboard). Supabase CLI has no `auth create-user`.
 *
 * Requires in .env.local (or env):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Usage:
 *   SEED_ADMIN_EMAIL=you@example.com SEED_ADMIN_PASSWORD='your-password' node --env-file=.env.local scripts/seed-admin-user.mjs
 *
 * Optional:
 *   SEED_ORG_NAME="My test workspace"
 *   SEED_DISPLAY_NAME="Admin"
 */
import { createClient } from '@supabase/supabase-js';

const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const email = (process.env.SEED_ADMIN_EMAIL || '').trim().toLowerCase();
const password = process.env.SEED_ADMIN_PASSWORD || '';
const orgName = (process.env.SEED_ORG_NAME || 'Test workspace').trim();
const displayName = (process.env.SEED_DISPLAY_NAME || '').trim() || email.split('@')[0] || 'Admin';

function fail(msg) {
  console.error(msg);
  process.exit(1);
}

if (!url) fail('Missing NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL).');
if (!serviceKey) fail('Missing SUPABASE_SERVICE_ROLE_KEY (Project Settings → API → service_role).');
if (!email) fail('Set SEED_ADMIN_EMAIL.');
if (!password || password.length < 8) fail('Set SEED_ADMIN_PASSWORD (min 8 characters, Supabase default).');

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserByEmail(target) {
  let page = 1;
  const perPage = 200;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const u = data.users.find((x) => (x.email || '').toLowerCase() === target);
    if (u) return u;
    if (!data.users.length || data.users.length < perPage) return null;
    page += 1;
  }
}

async function ensureProfileAdmin(userId) {
  const { data: profile, error: pErr } = await supabase.from('profiles').select('id, org_id, role').eq('id', userId).maybeSingle();
  if (pErr) throw pErr;

  if (profile?.org_id) {
    if (profile.role !== 'admin') {
      const { error } = await supabase.from('profiles').update({ role: 'admin', display_name: displayName }).eq('id', userId);
      if (error) throw error;
      console.log('Updated profile role to admin.');
    } else {
      console.log('Profile already has org + admin role.');
    }
    return;
  }

  const { data: org, error: oErr } = await supabase.from('organizations').insert({ name: orgName }).select('id').single();
  if (oErr) throw oErr;

  const { error: upErr } = await supabase.from('profiles').upsert(
    { id: userId, org_id: org.id, display_name: displayName, role: 'admin' },
    { onConflict: 'id' },
  );
  if (upErr) throw upErr;
  console.log('Created organization + admin profile (user had no org).');
}

try {
  let user = await findUserByEmail(email);

  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { org_name: orgName, full_name: displayName },
    });
    if (error) throw error;
    user = data.user;
    console.log('Created new Auth user (trigger should add org + admin profile).');
  } else {
    const { error } = await supabase.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
      user_metadata: { ...user.user_metadata, org_name: orgName, full_name: displayName },
    });
    if (error) throw error;
    console.log('Updated existing Auth user (password + confirmed email).');
  }

  await ensureProfileAdmin(user.id);

  console.log('Done. Sign in with:', email);
} catch (e) {
  console.error(e);
  process.exit(1);
}
