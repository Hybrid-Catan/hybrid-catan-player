const BASE_URL = "http://localhost:3000";

export async function setPhaseToSetup1(gameState: any) {
  const res = await fetch(`${BASE_URL}/api/game/turn/setup-1`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ gameState }),
  });

  return res.json();
}