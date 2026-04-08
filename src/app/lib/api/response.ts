import { NextResponse } from 'next/server';

export function apiSuccess<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true as const, data }, { status: 200, ...init });
}

export function apiError(message: string, status = 400, details?: unknown) {
  return NextResponse.json(
    { ok: false as const, error: message, ...(details !== undefined ? { details } : {}) },
    { status },
  );
}
