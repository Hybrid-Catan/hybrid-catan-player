const BASE_URL = "http://localhost:3000";

export async function addPlayer(payload: {
  gameState: any;
  name: string;
  color: string;
  sequence: number;
}) {
  const res = await fetch(`${BASE_URL}/api/init/player`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return res.json();
}