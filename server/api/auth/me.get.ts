import { isGameMasterRequest } from '../../utils/auth'

export default defineEventHandler((event) => {
  return { authenticated: isGameMasterRequest(event) }
})
