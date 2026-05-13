import { BASE_URL } from "@/lib/api/config";
import type { GameState } from "@/utils/types";

export async function bankTrade(
  gameState: GameState,
  senderId: string,
  give: string,
  get: string
) {
  const res = await fetch(`${BASE_URL}/api/game/trading/bank`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ gameState, senderId, give, get }),
  });

  return await res.json();
}
