const BASE_URL = "http://localhost:3000";
import type { GameState } from "@/utils/types";

export async function endTurn(gameState: GameState) {
  const res = await fetch(`${BASE_URL}/api/game/turn/end`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ gameState }),
  });

  return await res.json();
}
