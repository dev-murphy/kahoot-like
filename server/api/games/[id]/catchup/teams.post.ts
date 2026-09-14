import { TEAM_COLORS } from '#shared/types'
import { requireGameMaster } from '../../../../utils/auth'
import { notifyMaster } from '../../../../utils/catchupEngine'
import { createTeam, getActiveCatchupSession, listTeamsForSession } from '../../../../utils/repo'

export default defineEventHandler(async (event) => {
  requireGameMaster(event)
  const gameId = getRouterParam(event, 'id')!
  const session = getActiveCatchupSession(gameId)
  if (!session) throw createError({ statusCode: 404, statusMessage: 'No catch-up session is running' })
  if (session.status !== 'LOBBY') {
    throw createError({ statusCode: 409, statusMessage: 'Teams can only be added before the catch-up session begins' })
  }

  const body = await readBody<{ name?: string; color?: string }>(event)
  const name = (body?.name ?? '').trim()
  if (!name) throw createError({ statusCode: 400, statusMessage: 'Team name is required' })

  const existingCount = listTeamsForSession(session.id).length
  const color = body?.color || TEAM_COLORS[existingCount % TEAM_COLORS.length]!.value

  const team = createTeam(gameId, name, color, session.id)
  notifyMaster(gameId)
  return team
})
