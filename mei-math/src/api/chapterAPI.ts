export async function fetchChapters(grade: number, volume: number) {
  const url = `/api/chapters?grade=${grade}&volume=${volume}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch chapters");
  }
  return response.json();
}