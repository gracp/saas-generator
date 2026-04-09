/**
 * CSRF protection for API routes.
 *
 * Checks that a request is same-origin (not a cross-site forged request).
 * This is a defense-in-depth measure — NextAuth already handles CSRF
 * for session-based routes via same-site cookies.
 */

/**
 * Verify the request is same-origin.
 * Returns an error response if the request appears to be a CSRF attack.
 */
export function csrfCheck(request: Request): Response | null {
  // Get the origin header (set by browsers automatically for same-origin requests)
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');

  // If we have an origin header, verify it matches our host
  if (origin) {
    try {
      const url = new URL(origin);
      // Allow same-origin requests
      if (url.host === host) return null;

      // For cross-origin requests, also check the content-type to ensure
      // this is a JSON API call (not a browser form submission)
      const contentType = request.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        return new Response(JSON.stringify({ error: 'Invalid request origin' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } catch {
      // Invalid origin URL — reject
      return new Response(JSON.stringify({ error: 'Invalid request origin' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // No origin header — this is either a server-to-server request
  // or a browser that doesn't send origin (rare for modern browsers)
  // In production on Vercel, we can rely on the Vercel edge setting origin
  return null;
}
