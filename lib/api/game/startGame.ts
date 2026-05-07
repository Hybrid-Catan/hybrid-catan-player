const BASE_URL = "http://localhost:3000";

export async function startGame(gameState: any) {
  const res = await fetch(`${BASE_URL}/api/init/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ gameState }),
  });

  return res.json();
}