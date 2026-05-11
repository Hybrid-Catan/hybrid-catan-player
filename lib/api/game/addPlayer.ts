import { BASE_URL } from "@/lib/api/config";

export async function addPlayer(payload: {
  gameId: any;
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