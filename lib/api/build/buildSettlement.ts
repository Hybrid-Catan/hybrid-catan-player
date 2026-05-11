import { BASE_URL } from "@/lib/api/config";

export async function buildSettlement(gameState: any) {
  const res = await fetch(`${BASE_URL}/api/game/build/settlement`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ gameState }),
  });

  return res.json();
}