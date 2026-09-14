import { requireGameMaster } from '../utils/auth'
import { buildFullExport } from '../utils/gameExport'

export default defineEventHandler((event) => {
  requireGameMaster(event)
  return buildFullExport()
})
