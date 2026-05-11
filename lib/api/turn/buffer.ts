import { BASE_URL } from "@/lib/api/config";
import type { GameState } from "@/utils/types";

export async function rollDice(gameState: GameState) {
  const res = await fetch(`${BASE_URL}/api/game/turn/buffer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(gameState),
  });

  return await res.json();
}