import { BASE_URL } from "@/lib/api/config";

export async function playInvention(gameState: any, resource1: string, resource2: string) {
  const res = await fetch(`${BASE_URL}/api/game/devCard/invention`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ gameState, resource1, resource2 }),
  });
  return res.json();
}
