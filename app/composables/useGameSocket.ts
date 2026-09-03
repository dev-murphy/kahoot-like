import type { ClientMessage, ServerMessage } from '#shared/types'

export type SocketStatus = 'connecting' | 'open' | 'closed'

export function useGameSocket(urlFactory: () => string, onMessage: (msg: ServerMessage) => void) {
  const status = ref<SocketStatus>('connecting')
  let ws: WebSocket | null = null
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  let heartbeat: ReturnType<typeof setInterval> | null = null
  let manualClose = false
  let attempt = 0

  function stopHeartbeat() {
    if (heartbeat) clearInterval(heartbeat)
    heartbeat = null
  }

  function startHeartbeat() {
    stopHeartbeat()
    heartbeat = setInterval(() => send({ type: 'PING' }), 25000)
  }

  function connect() {
    if (typeof window === 'undefined') return
    status.value = 'connecting'
    const url = urlFactory()
    ws = new WebSocket(url)

    ws.onopen = () => {
      status.value = 'open'
      attempt = 0
      startHeartbeat()
    }
    ws.onmessage = (ev) => {
      try {
        onMessage(JSON.parse(ev.data) as ServerMessage)
      } catch {
        // ignore malformed frames
      }
    }
    ws.onclose = () => {
      status.value = 'closed'
      stopHeartbeat()
      if (!manualClose) scheduleReconnect()
    }
    ws.onerror = () => {
      ws?.close()
    }
  }

  function scheduleReconnect() {
    if (reconnectTimer) return
    attempt++
    const delay = Math.min(1000 * attempt, 5000)
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null
      connect()
    }, delay)
  }

  function send(message: ClientMessage) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message))
    }
  }

  function close() {
    manualClose = true
    if (reconnectTimer) clearTimeout(reconnectTimer)
    stopHeartbeat()
    ws?.close()
  }

  onMounted(connect)
  onUnmounted(close)

  return { status, send, close, reconnect: connect }
}

export function wsBaseUrl(): string {
  if (typeof window === 'undefined') return ''
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${window.location.host}/ws`
}
