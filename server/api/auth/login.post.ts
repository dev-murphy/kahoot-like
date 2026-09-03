import { issueGameMasterSession } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ username?: string; password?: string }>(event)
  const config = useRuntimeConfig(event)

  const username = body?.username?.trim() ?? ''
  const password = body?.password ?? ''

  if (!config.gameMasterPassword) {
    throw createError({
      statusCode: 500,
      statusMessage: 'GAME_MASTER_PASSWORD is not configured on the server.'
    })
  }

  if (username !== config.gameMasterUsername || password !== config.gameMasterPassword) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid username or password' })
  }

  issueGameMasterSession(event)
  return { ok: true }
})
