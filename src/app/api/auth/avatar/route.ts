import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../lib/supabase/server';
import { getSupabaseAdmin, isSupabaseAdminConfigured } from '../../../lib/supabase/admin';
import { clearUserSession } from '../../../lib/auth/session-cache';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export async function POST(request: NextRequest) {
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

    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'file required' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
    }
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    const ext = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1] || 'bin';
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const buf = Buffer.from(await file.arrayBuffer());

    const admin = getSupabaseAdmin();
    const { error: upErr } = await admin.storage.from('avatars').upload(path, buf, {
      contentType: file.type,
      upsert: true,
    });
    if (upErr) {
      console.error('[auth/avatar] upload', upErr);
      return NextResponse.json({ error: upErr.message }, { status: 500 });
    }

    const {
      data: { publicUrl },
    } = admin.storage.from('avatars').getPublicUrl(path);

    const { error: pErr } = await admin
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id);
    if (pErr) {
      return NextResponse.json({ error: pErr.message }, { status: 500 });
    }

    await clearUserSession(user.id);

    return NextResponse.json({ ok: true, avatar_url: publicUrl });
  } catch (e) {
    console.error('[auth/avatar]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
