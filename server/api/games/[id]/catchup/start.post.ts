import { TEAM_COLORS } from '#shared/types'
import { requireGameMaster } from '../../../../utils/auth'
import { notifyMaster } from '../../../../utils/catchupEngine'
import { createCatchupSession, createTeam, getActiveCatchupSession, getGame } from '../../../../utils/repo'

export default defineEventHandler((event) => {
  requireGameMaster(event)
  const gameId = getRouterParam(event, 'id')!
  const game = getGame(gameId)
  if (!game) throw createError({ statusCode: 404, statusMessage: 'Game not found' })
  if (game.status === 'DRAFT' || game.status === 'LOBBY') {
    throw createError({
      statusCode: 409,
      statusMessage: 'Start the main game before opening a catch-up session — latecomers can join the lobby normally until then'
    })
  }
  if (getActiveCatchupSession(gameId)) {
    throw createError({ statusCode: 409, statusMessage: 'A catch-up session is already running for this game' })
  }

  const session = createCatchupSession(gameId)

  // TEAM mode: one shared team for every latecomer to join — INDIVIDUAL mode
  // gives each latecomer their own personal team at join time, same as usual.
  if (game.mode === 'TEAM') {
    const color = TEAM_COLORS[Math.floor(Math.random() * TEAM_COLORS.length)]!.value
    createTeam(gameId, 'Catch-up Squad', color, session.id)
  }

  notifyMaster(gameId)
  return session
})
