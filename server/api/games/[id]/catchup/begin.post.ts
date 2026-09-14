import { requireGameMaster } from '../../../../utils/auth'
import { beginCatchupSession } from '../../../../utils/catchupEngine'
import { getActiveCatchupSession } from '../../../../utils/repo'

export default defineEventHandler((event) => {
  requireGameMaster(event)
  const gameId = getRouterParam(event, 'id')!
  const session = getActiveCatchupSession(gameId)
  if (!session) throw createError({ statusCode: 404, statusMessage: 'No catch-up session is waiting to begin' })
  if (session.status !== 'LOBBY') {
    throw createError({ statusCode: 409, statusMessage: 'This catch-up session has already begun' })
  }
  beginCatchupSession(session.id)
  return { ok: true }
})
