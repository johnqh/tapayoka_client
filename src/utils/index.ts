/** Build API URL from base and path segments */
export function buildUrl(baseUrl: string, ...segments: string[]): string {
  const base = baseUrl.replace(/\/+$/, '');
  const path = segments.map(s => s.replace(/^\/+|\/+$/g, '')).join('/');
  return `${base}/${path}`;
}

/** Extract error message from unknown error */
export function getErrorMessage(err: unknown, fallback = 'An error occurred'): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return fallback;
}
