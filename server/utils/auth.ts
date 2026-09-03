import type { H3Event } from 'h3'
import { createSession, isValidSession } from './repo'

export const GM_COOKIE = 'gm_session'

export function playerCookieName(pin: string): string {
  return `qr_player_${pin}`
}

export function issueGameMasterSession(event: H3Event): string {
  const token = createSession()
  setCookie(event, GM_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12
  })
  return token
}

export function requireGameMaster(event: H3Event): void {
  const token = getCookie(event, GM_COOKIE)
  if (!isValidSession(token)) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }
}

export function isGameMasterRequest(event: H3Event): boolean {
  const token = getCookie(event, GM_COOKIE)
  return isValidSession(token)
}

export function setPlayerCookie(event: H3Event, pin: string, token: string): void {
  setCookie(event, playerCookieName(pin), token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12
  })
}

export function getPlayerToken(event: H3Event, pin: string): string | undefined {
  return getCookie(event, playerCookieName(pin))
}

/** Minimal cookie parser for use inside the raw WebSocket upgrade request. */
export function parseCookieHeader(header: string | null | undefined): Record<string, string> {
  const out: Record<string, string> = {}
  if (!header) return out
  for (const part of header.split(';')) {
    const idx = part.indexOf('=')
    if (idx === -1) continue
    const key = part.slice(0, idx).trim()
    const value = part.slice(idx + 1).trim()
    if (key) out[key] = decodeURIComponent(value)
  }
  return out
}
