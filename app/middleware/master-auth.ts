export default defineNuxtRouteMiddleware(async () => {
  const requestFetch = useAuthedFetch()
  try {
    const res = await requestFetch<{ authenticated: boolean }>('/api/auth/me')
    if (!res.authenticated) {
      return navigateTo('/master/login')
    }
  } catch {
    return navigateTo('/master/login')
  }
})
