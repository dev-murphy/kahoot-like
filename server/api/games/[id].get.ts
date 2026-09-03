import { requireGameMaster } from '../../utils/auth'
import { getGame, listPlayers, listQuestions, listTeams } from '../../utils/repo'

export default defineEventHandler((event) => {
  requireGameMaster(event)
  const id = getRouterParam(event, 'id')!
  const game = getGame(id)
  if (!game) throw createError({ statusCode: 404, statusMessage: 'Game not found' })
  return {
    game,
    questions: listQuestions(id),
    teams: listTeams(id),
    players: listPlayers(id)
  }
})
