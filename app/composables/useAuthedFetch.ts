type SimpleFetch = <T>(url: string, opts?: Record<string, unknown>) => Promise<T>

/**
 * On the server, plain `$fetch` does not forward the incoming request's
 * cookies to internal API calls, so SSR-rendered pages that call protected
 * `/api/*` routes need `useRequestFetch()` instead. On the client this is
 * unnecessary (the browser sends cookies automatically), so we fall back to
 * `$fetch`. Kept behind a simple function type to avoid TS route-literal
 * inference blowing up on complex Nitro fetch typings.
 */
export function useAuthedFetch(): SimpleFetch {
  if (import.meta.server) {
    return useRequestFetch() as SimpleFetch
  }
  return $fetch as SimpleFetch
}
