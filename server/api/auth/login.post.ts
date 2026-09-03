import { issueGameMasterSession } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ username?: string; password?: string }>(event)

  const expectedUsername = process.env.GAME_MASTER_USERNAME || 'admin'
  const expectedPassword = process.env.GAME_MASTER_PASSWORD || ''

  const username = body?.username?.trim() ?? ''
  const password = body?.password ?? ''

  if (!expectedPassword) {
    throw createError({
      statusCode: 500,
      statusMessage: 'GAME_MASTER_PASSWORD is not configured on the server.'
    })
  }

  if (username !== expectedUsername || password !== expectedPassword) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid username or password' })
  }

  issueGameMasterSession(event)
  return { ok: true }
})
