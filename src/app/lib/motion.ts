'use client';

/**
 * Operations Hub — Motion System
 *
 * Design references:
 *   - Apple UIKit spring: response=0.35, dampingFraction=0.72
 *   - Framer Motion site: stiffness:400, damping:30
 *   - Linear.app: [0.16,1,0.3,1] ease-out-expo
 *
 * RULE: Never use linear or plain easeOut for UI. Always spring or expo-easing.
 */

// ─── Spring presets ────────────────────────────────────────────────────────

/** Snappy — nav indicators, tab pills, micro-interactions */
export const springSnap   = { type: 'spring' as const, stiffness: 480, damping: 36, mass: 0.8 };

/** Bouncy — card lifts, modal opens, scale-ins */
export const springBounce = { type: 'spring' as const, stiffness: 340, damping: 24, mass: 0.9 };

/** Smooth — page transitions, drawer opens, large layout shifts */
export const springSmooth = { type: 'spring' as const, stiffness: 280, damping: 32, mass: 1 };

/** Gentle — subtle stagger children, fade-ups */
export const springGently = { type: 'spring' as const, stiffness: 200, damping: 28, mass: 1 };

// ─── Cubic-bezier easings ──────────────────────────────────────────────────

/** Ease-out-expo — Apple's UI easing */
export const EASE_OUT_EXPO   = [0.16, 1, 0.3, 1] as [number, number, number, number];

/** Ease-out-quart */
export const EASE_OUT_QUART  = [0.25, 1, 0.5, 1] as [number, number, number, number];

/** Ease-in for exits */
export const EASE_IN         = [0.4, 0, 1, 1] as [number, number, number, number];

// ─── Page transition ───────────────────────────────────────────────────────

export const pageTransition = {
  initial: { opacity: 0, y: 10, filter: 'blur(2px)' },
  animate: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.32, ease: EASE_OUT_EXPO },
  },
  exit: {
    opacity: 0, y: -6, filter: 'blur(1px)',
    transition: { duration: 0.18, ease: EASE_IN },
  },
};

// ─── Section entry ─────────────────────────────────────────────────────────

export const sectionEntry = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.48, ease: EASE_OUT_EXPO } },
};

// ─── Stagger containers ────────────────────────────────────────────────────

export const staggerFast = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.045, delayChildren: 0.05 } },
};

export const staggerContainer = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

export const staggerSlow = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

// ─── Child item variants ───────────────────────────────────────────────────

export const fadeInUp = {
  hidden:  { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT_EXPO } },
};

export const fadeIn = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
};

export const scaleIn = {
  hidden:  { opacity: 0, scale: 0.93, y: 6 },
  visible: { opacity: 1, scale: 1,    y: 0, transition: springBounce },
};

export const slideInRight = {
  hidden:  { x: '100%', opacity: 0 },
  visible: { x: 0, opacity: 1, transition: springSmooth },
  exit:    { x: '100%', opacity: 0, transition: { duration: 0.2, ease: EASE_IN } },
};

export const slideInLeft = {
  hidden:  { x: '-100%', opacity: 0 },
  visible: { x: 0, opacity: 1, transition: springSmooth },
  exit:    { x: '-100%', opacity: 0, transition: { duration: 0.2, ease: EASE_IN } },
};

// ─── Interactive element presets ───────────────────────────────────────────

export const cardInteraction = {
  whileHover: { y: -2, scale: 1.008, transition: springSnap },
  whileTap:   { scale: 0.97, transition: { duration: 0.08 } },
};

export const buttonInteraction = {
  whileHover: { scale: 1.02, transition: springSnap },
  whileTap:   { scale: 0.96, transition: { duration: 0.08 } },
};

export const rowInteraction = {
  whileHover: { x: 2, transition: { duration: 0.15 } },
  whileTap:   { scale: 0.995 },
};

// ─── Number counter easing ─────────────────────────────────────────────────
export function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}
