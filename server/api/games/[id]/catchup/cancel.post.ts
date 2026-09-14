import { requireGameMaster } from '../../../../utils/auth'
import { cancelCatchupSession } from '../../../../utils/catchupEngine'
import { getActiveCatchupSession } from '../../../../utils/repo'

export default defineEventHandler((event) => {
  requireGameMaster(event)
  const gameId = getRouterParam(event, 'id')!
  const session = getActiveCatchupSession(gameId)
  if (!session) throw createError({ statusCode: 404, statusMessage: 'No catch-up session is running' })
  cancelCatchupSession(session.id)
  return { ok: true }
})
