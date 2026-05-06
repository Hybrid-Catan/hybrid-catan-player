const BASE_URL = "http://localhost:3000";

export async function addPlayer(gameState: any, name: string, color: string) {
  const res = await fetch(`${BASE_URL}/api/init/player`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      gameState,
      name,
      color,
      sequence: gameState?.players?.length ?? 0,
    }),
  });

  return res.json();
}