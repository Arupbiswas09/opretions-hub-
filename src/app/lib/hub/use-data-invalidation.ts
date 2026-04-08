'use client';

import { useEffect, useRef, useState } from 'react';
import { HUB_EVENTS } from '../hub-events';

/**
 * Bumps `version` when `hub:data-invalidation` fires and the scope matches.
 * Example: `useHubDataInvalidation('contacts', 'all')` or `('deals', 'pipeline', 'sales', 'all')`.
 */
export function useHubDataInvalidation(...scopes: string[]): number {
  const [version, setVersion] = useState(0);
  const scopeKey = [...scopes].sort().join('|');
  const scopesRef = useRef(scopes);
  scopesRef.current = scopes;

  useEffect(() => {
    const onInv = (e: Event) => {
      const scope = (e as CustomEvent<string>).detail ?? 'all';
      if (scope === 'all' || scopesRef.current.includes(scope)) {
        setVersion((v) => v + 1);
      }
    };
    window.addEventListener(HUB_EVENTS.DATA_INVALIDATION, onInv);
    return () => window.removeEventListener(HUB_EVENTS.DATA_INVALIDATION, onInv);
  }, [scopeKey]);

  return version;
}
