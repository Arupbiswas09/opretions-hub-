import { NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseAdminConfigured } from '../../../lib/supabase/admin';
import * as fs from 'fs';
import * as path from 'path';

/**
 * POST /api/admin/setup-db
 * Applies the migration SQL to create all tables.
 * Only works in development with HUB_BYPASS_AUTH=1.
 */
export async function POST() {
  if (process.env.HUB_BYPASS_AUTH !== '1') {
    return NextResponse.json({ error: 'Only available in dev mode' }, { status: 403 });
  }
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const db = getSupabaseAdmin();
  
  // Read the migration file
  const migrationPath = path.join(process.cwd(), 'supabase/migrations/00001_hub_erp_core.sql');
  
  let sql: string;
  try {
    sql = fs.readFileSync(migrationPath, 'utf-8');
  } catch (e) {
    return NextResponse.json({ error: `Migration file not found: ${migrationPath}` }, { status: 404 });
  }

  // Execute statements one at a time (split on semicolons followed by newlines)
  // Skip the profiles table since it references auth.users which may not exist
  const statements = sql.split(/;\s*\n/).filter(s => s.trim().length > 10);
  
  const results: { index: number; success: boolean; error?: string; sql?: string }[] = [];
  
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i].trim();
    if (!stmt) continue;
    
    // Skip statements that reference auth.users (profiles table)
    if (stmt.includes('references auth.users')) {
      // Create a simplified profiles table without the FK
      const { error } = await db.rpc('exec_sql', {
        query: `create table if not exists public.profiles (
          id uuid primary key default gen_random_uuid(),
          org_id uuid,
          role text not null default 'member',
          display_name text,
          avatar_url text,
          created_at timestamptz not null default now(),
          updated_at timestamptz not null default now()
        );`
      });
      results.push({ index: i, success: !error, error: error?.message, sql: 'profiles (simplified)' });
      continue;
    }

    try {
      const { error } = await db.rpc('exec_sql', { query: stmt + ';' });
      results.push({
        index: i,
        success: !error,
        error: error?.message,
        sql: stmt.slice(0, 80) + '...',
      });
    } catch (e) {
      results.push({
        index: i,
        success: false,
        error: e instanceof Error ? e.message : 'Unknown error',
        sql: stmt.slice(0, 80) + '...',
      });
    }
  }

  const succeeded = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  return NextResponse.json({
    message: `Executed ${results.length} statements: ${succeeded} succeeded, ${failed} failed`,
    results: results.filter(r => !r.success), // Only show failures
  });
}
