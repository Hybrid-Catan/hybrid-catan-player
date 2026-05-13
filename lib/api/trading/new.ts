import { BASE_URL } from "@/lib/api/config";
import type { GameState } from "@/utils/types";

type ResourceCards = {
  WOOD: number;
  BRICK: number;
  WOOL: number;
  WHEAT: number;
  ORE: number;
};

export async function newTrade(
  gameState: GameState,
  sender: string,
  receiver: string,
  sendingCards: ResourceCards,
  receivingCards: ResourceCards
) {
  const res = await fetch(`${BASE_URL}/api/game/trading/new`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      gameState,
      sender,
      receiver,
      sendingCards,
      receivingCards,
    }),
  });

  return await res.json();
}
