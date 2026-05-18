import { BASE_URL } from "@/lib/api/config";

export async function playMonopoly(gameState: any, resource: string) {
  const res = await fetch(`${BASE_URL}/api/game/devCard/monopoly`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ gameState, resource }),
  });
  return res.json();
}
