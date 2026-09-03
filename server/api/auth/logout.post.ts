import { GM_COOKIE } from '../../utils/auth'
import { deleteSession } from '../../utils/repo'

export default defineEventHandler((event) => {
  const token = getCookie(event, GM_COOKIE)
  if (token) deleteSession(token)
  deleteCookie(event, GM_COOKIE, { path: '/' })
  return { ok: true }
})
