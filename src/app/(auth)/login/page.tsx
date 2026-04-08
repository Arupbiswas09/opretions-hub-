'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createSupabaseBrowserClient, isSupabaseBrowserConfigured } from '../../lib/supabase/client';
import { BonsaiButton } from '../../components/bonsai/BonsaiButton';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/hub/dashboard';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isSupabaseBrowserConfigured()) {
    return (
      <div className="mx-auto w-full max-w-[400px] rounded-2xl border border-border p-8 hub-surface">
        <h1 className="text-lg font-semibold text-foreground">Sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add <code className="text-xs">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
          <code className="text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to <code className="text-xs">.env.local</code>{' '}
          to enable authentication.
        </p>
        <Link
          href="/hub/dashboard"
          className="mt-6 inline-block text-sm font-medium text-primary hover:underline"
        >
          Continue without auth (dev)
        </Link>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signErr } = await supabase.auth.signInWithPassword({ email, password });
      if (signErr) {
        setError(signErr.message);
        return;
      }
      await fetch('/api/auth/warm-session', { method: 'POST', credentials: 'include' });
      router.push(next);
      router.refresh();
    } catch {
      setError('Sign in failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[400px] rounded-2xl border border-border p-8 hub-surface shadow-xl">
      <h1 className="text-lg font-semibold text-foreground">Sign in</h1>
      <p className="mt-1 text-sm text-muted-foreground">Operations Hub</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Email</label>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="hub-field w-full rounded-xl px-3 py-2 text-sm"
            placeholder="you@company.com"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Password</label>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="hub-field w-full rounded-xl px-3 py-2 text-sm"
          />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <BonsaiButton type="submit" className="w-full" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </BonsaiButton>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        No account?{' '}
        <Link href="/signup" className="font-medium text-primary hover:underline">
          Create workspace
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <Suspense fallback={<div className="text-muted-foreground text-sm">Loading…</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
