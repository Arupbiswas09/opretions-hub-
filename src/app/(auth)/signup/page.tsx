'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createSupabaseBrowserClient, isSupabaseBrowserConfigured } from '../../lib/supabase/client';
import { BonsaiButton } from '../../components/bonsai/BonsaiButton';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errParam = searchParams.get('error');
  const [orgName, setOrgName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(errParam === 'auth' ? 'Authentication failed' : '');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isSupabaseBrowserConfigured()) {
    return (
      <div className="mx-auto w-full max-w-[400px] rounded-2xl border border-border p-8 hub-surface">
        <h1 className="text-lg font-semibold text-foreground">Create workspace</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Configure Supabase env vars in <code className="text-xs">.env.local</code> first.
        </p>
        <Link href="/login" className="mt-6 inline-block text-sm font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error: signErr } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            org_name: orgName.trim() || 'Workspace',
            full_name: fullName.trim(),
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/hub/dashboard`,
        },
      });
      if (signErr) {
        setError(signErr.message);
        return;
      }
      if (data.session) {
        await fetch('/api/auth/warm-session', { method: 'POST', credentials: 'include' });
        router.push('/hub/dashboard');
        router.refresh();
        return;
      }
      setInfo('Check your email to confirm your account, then sign in.');
    } catch {
      setError('Sign up failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[400px] rounded-2xl border border-border p-8 hub-surface shadow-xl">
      <h1 className="text-lg font-semibold text-foreground">Create workspace</h1>
      <p className="mt-1 text-sm text-muted-foreground">Organization + your account</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Organization name</label>
          <input
            type="text"
            required
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            className="hub-field w-full rounded-xl px-3 py-2 text-sm"
            placeholder="Acme Inc."
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Your name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="hub-field w-full rounded-xl px-3 py-2 text-sm"
            placeholder="Jane Doe"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Work email</label>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="hub-field w-full rounded-xl px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Password</label>
          <input
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="hub-field w-full rounded-xl px-3 py-2 text-sm"
          />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {info ? <p className="text-sm text-muted-foreground">{info}</p> : null}
        <BonsaiButton type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating…' : 'Create workspace'}
        </BonsaiButton>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <Suspense fallback={<div className="text-muted-foreground text-sm">Loading…</div>}>
        <SignupForm />
      </Suspense>
    </div>
  );
}
