import type { ServerMessage } from '#shared/types'

export interface PeerMeta {
  role: 'player' | 'master'
  gameId: string
  playerId?: string
}

// Minimal structural type so we don't need to depend on crossws' exact export shape.
export interface WsPeer {
  send: (data: string) => void
  close: (code?: number, reason?: string) => void
}

const peerMeta = new WeakMap<WsPeer, PeerMeta>()
const gamePeers = new Map<string, Set<WsPeer>>()

export function registerPeer(peer: WsPeer, meta: PeerMeta): void {
  peerMeta.set(peer, meta)
  if (!gamePeers.has(meta.gameId)) gamePeers.set(meta.gameId, new Set())
  gamePeers.get(meta.gameId)!.add(peer)
}

export function unregisterPeer(peer: WsPeer): PeerMeta | undefined {
  const meta = peerMeta.get(peer)
  if (meta) {
    gamePeers.get(meta.gameId)?.delete(peer)
  }
  peerMeta.delete(peer)
  return meta
}

export function getPeerMeta(peer: WsPeer): PeerMeta | undefined {
  return peerMeta.get(peer)
}

export function sendMessage(peer: WsPeer, message: ServerMessage): void {
  try {
    peer.send(JSON.stringify(message))
  } catch {
    // ignore send errors on dead sockets
  }
}

export function broadcast(gameId: string, message: ServerMessage, exclude?: WsPeer): void {
  const peers = gamePeers.get(gameId)
  if (!peers) return
  const data = JSON.stringify(message)
  for (const p of peers) {
    if (p === exclude) continue
    try {
      p.send(data)
    } catch {
      // ignore
    }
  }
}

export function broadcastToPlayers(gameId: string, playerIds: Set<string>, message: ServerMessage): void {
  const peers = gamePeers.get(gameId)
  if (!peers) return
  const data = JSON.stringify(message)
  for (const p of peers) {
    const meta = peerMeta.get(p)
    if (meta?.playerId && playerIds.has(meta.playerId)) {
      try {
        p.send(data)
      } catch {
        // ignore
      }
    }
  }
}

export function sendToPlayer(gameId: string, playerId: string, message: ServerMessage): void {
  broadcastToPlayers(gameId, new Set([playerId]), message)
}

export function disconnectPlayerSockets(gameId: string, playerId: string, message: ServerMessage): void {
  const peers = gamePeers.get(gameId)
  if (!peers) return
  for (const p of Array.from(peers)) {
    const meta = peerMeta.get(p)
    if (meta?.playerId === playerId) {
      sendMessage(p, message)
      p.close()
    }
  }
}

export function getPeersForGame(gameId: string): { peer: WsPeer; meta: PeerMeta }[] {
  const peers = gamePeers.get(gameId)
  if (!peers) return []
  return [...peers].map((peer) => ({ peer, meta: peerMeta.get(peer)! }))
}

export function getConnectedPlayerIds(gameId: string): Set<string> {
  const peers = gamePeers.get(gameId)
  const out = new Set<string>()
  if (!peers) return out
  for (const p of peers) {
    const meta = peerMeta.get(p)
    if (meta?.playerId) out.add(meta.playerId)
  }
  return out
}
