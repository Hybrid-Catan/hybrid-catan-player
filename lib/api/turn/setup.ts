const BASE_URL = "http://localhost:3000";
import type { GameState } from "@/utils/types";

export async function confirmSetupRoad(gameState: GameState) {
  const res = await fetch(`${BASE_URL}/api/game/turn/setup`, {
    method: "POST",
    headers: { "Content-Type": "application/json",},
    body: JSON.stringify({ gameState }),
  });

  const data = await res.json();
  return data;
}