import type { FirebaseIdToken } from '../types';

/** Build API URL from base and path segments */
export function buildUrl(baseUrl: string, ...segments: string[]): string {
  const base = baseUrl.replace(/\/+$/, '');
  const path = segments.map(s => s.replace(/^\/+|\/+$/g, '')).join('/');
  return `${base}/${path}`;
}

/** Extract error message from unknown error */
export function getErrorMessage(
  err: unknown,
  fallback = 'An error occurred'
): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return fallback;
}

/** Create authentication headers for Firebase-protected endpoints */
export function createAuthHeaders(
  token: FirebaseIdToken
): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

/** Create standard request headers (no auth) */
export function createHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

/** API error with structured information */
export class TapayokaApiError extends Error {
  readonly statusCode: number | undefined;
  readonly errorCode: string | undefined;
  readonly details: string | undefined;

  constructor(
    message: string,
    options?: {
      statusCode?: number;
      errorCode?: string;
      details?: string;
    }
  ) {
    super(message);
    this.name = 'TapayokaApiError';
    this.statusCode = options?.statusCode;
    this.errorCode = options?.errorCode;
    this.details = options?.details;
  }
}

/** Handle API errors from response */
export function handleApiError(
  response: unknown,
  operation: string
): TapayokaApiError {
  const resp = response as {
    status?: number;
    data?: {
      error?: string;
      message?: string;
      code?: string;
      details?: string;
    };
  };
  const errorMessage =
    resp?.data?.error || resp?.data?.message || 'Unknown error';
  return new TapayokaApiError(`Failed to ${operation}: ${errorMessage}`, {
    statusCode: resp?.status,
    errorCode: resp?.data?.code,
    details: resp?.data?.details,
  });
}
