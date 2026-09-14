import type { GameMode } from '#shared/types'
import { requireGameMaster } from '../../utils/auth'
import { createGame } from '../../utils/repo'

export default defineEventHandler(async (event) => {
  requireGameMaster(event)
  const body = await readBody<{ title?: string; mode?: GameMode }>(event)
  const title = (body?.title ?? '').trim()
  if (!title) throw createError({ statusCode: 400, statusMessage: 'Title is required' })
  const mode: GameMode = body?.mode === 'INDIVIDUAL' ? 'INDIVIDUAL' : 'TEAM'
  return createGame(title, mode)
})
