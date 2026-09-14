import { TEAM_COLORS } from '#shared/types'
import { requireGameMaster } from '../../../utils/auth'
import { createTeam, getGame, listMainTeams } from '../../../utils/repo'
import { broadcast } from '../../../utils/wsRegistry'

export default defineEventHandler(async (event) => {
  requireGameMaster(event)
  const gameId = getRouterParam(event, 'id')!
  const game = getGame(gameId)
  if (!game) throw createError({ statusCode: 404, statusMessage: 'Game not found' })

  const body = await readBody<{ name?: string; color?: string }>(event)
  const name = (body?.name ?? '').trim()
  if (!name) throw createError({ statusCode: 400, statusMessage: 'Team name is required' })

  const existingCount = listMainTeams(gameId).length
  const color = body?.color || TEAM_COLORS[existingCount % TEAM_COLORS.length]!.value

  const team = createTeam(gameId, name, color)
  broadcast(gameId, { type: 'TEAM_CREATED', team })
  return team
})
