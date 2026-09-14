import type { FullExportBundle } from '../utils/gameExport'
import { requireGameMaster } from '../utils/auth'
import { importFullExport } from '../utils/gameExport'

export default defineEventHandler(async (event) => {
  requireGameMaster(event)
  const body = await readBody<Partial<FullExportBundle>>(event)
  if (!body || !Array.isArray(body.games)) {
    throw createError({ statusCode: 400, statusMessage: 'Import file must contain a "games" array' })
  }
  return importFullExport(body as FullExportBundle)
})
