import { requireGameMaster } from '../../../utils/auth'
import { buildGameExport } from '../../../utils/gameExport'

export default defineEventHandler((event) => {
  requireGameMaster(event)
  const id = getRouterParam(event, 'id')!
  const data = buildGameExport(id)
  if (!data) throw createError({ statusCode: 404, statusMessage: 'Game not found' })
  return { exportedAt: Date.now(), ...data }
})
