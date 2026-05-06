const BASE_URL = "http://localhost:3000";

export async function buildCity(gameState: any) {
  const res = await fetch(`${BASE_URL}/api/game/build/city`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ gameState }),
  });

  return res.json();
}