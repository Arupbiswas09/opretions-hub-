'use client';

import { useEffect, useRef } from 'react';
import { isSupabaseBrowserConfigured } from '../../lib/supabase/client';

/** Populate Redis session cache once per hub mount (Phase 1). */
export function SessionWarmup() {
  const done = useRef(false);
  useEffect(() => {
    if (!isSupabaseBrowserConfigured() || done.current) return;
    done.current = true;
    void fetch('/api/auth/warm-session', { method: 'POST', credentials: 'include' });
  }, []);
  return null;
}
