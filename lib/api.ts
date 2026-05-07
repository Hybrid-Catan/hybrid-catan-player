import type { GameState } from '@/utils/types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

async function post(path: string, gameState: GameState): Promise<GameState> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gameState }),
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  const json = await res.json()
  return json.data
}

export const buildSettlement = (gameState: GameState) =>
  post('/api/game/build/settlement', gameState)

export const buildRoad = (gameState: GameState) =>
  post('/api/game/build/road', gameState)

export const advanceToSetup2 = (gameState: GameState) =>
  post('/api/game/turn/setup-2', gameState)
