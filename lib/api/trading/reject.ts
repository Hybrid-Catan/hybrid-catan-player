import { BASE_URL } from "@/lib/api/config";
import type { GameState } from "@/utils/types";

export async function rejectTrade(gameState: GameState, tradeIndex: number) {
  const res = await fetch(`${BASE_URL}/api/game/trading/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ gameState, tradeIndex }),
  });

  return await res.json();
}
