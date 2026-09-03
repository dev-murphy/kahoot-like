import { requireGameMaster } from '../../utils/auth'
import { createGame } from '../../utils/repo'

export default defineEventHandler(async (event) => {
  requireGameMaster(event)
  const body = await readBody<{ title?: string }>(event)
  const title = (body?.title ?? '').trim()
  if (!title) throw createError({ statusCode: 400, statusMessage: 'Title is required' })
  return createGame(title)
})
