import { NextResponse } from 'next/server';

export type ApiErrorCode =
  | 'UNAUTHORIZED'
  | 'NOT_FOUND'
  | 'BAD_REQUEST'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'
  | 'FORBIDDEN';

const ERROR_MESSAGES: Record<ApiErrorCode, string> = {
  UNAUTHORIZED: 'Authentication required',
  NOT_FOUND: 'Resource not found',
  BAD_REQUEST: 'Invalid request',
  RATE_LIMITED: 'Too many requests — please try again later',
  INTERNAL_ERROR: 'Something went wrong',
  FORBIDDEN: "You don't have permission to do that",
};

/** Standardized API error response */
export function apiError(code: ApiErrorCode, message?: string, status = 400): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message ?? ERROR_MESSAGES[code],
      code,
    },
    { status }
  );
}

/** Standardized success response with optional data */
export function apiSuccess<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ success: true, ...data }, { status });
}

/** 401 helper */
export function unauthorized(message?: string): NextResponse {
  return apiError('UNAUTHORIZED', message, 401);
}

/** 404 helper */
export function notFound(message?: string): NextResponse {
  return apiError('NOT_FOUND', message, 404);
}

/** 400 helper */
export function badRequest(message?: string): NextResponse {
  return apiError('BAD_REQUEST', message, 400);
}

/** 429 helper */
export function rateLimited(retryAfter?: number): NextResponse {
  const headers: Record<string, string> = {};
  if (retryAfter) headers['Retry-After'] = String(retryAfter);
  return apiError('RATE_LIMITED', undefined, 429);
}
