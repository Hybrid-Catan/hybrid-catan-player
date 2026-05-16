import { BASE_URL } from "@/lib/api/config";

export async function buildDev(gameState: any) {
  const res = await fetch(`${BASE_URL}/api/game/build/devCard`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ gameState }),
  });
  
  return res.json();
}