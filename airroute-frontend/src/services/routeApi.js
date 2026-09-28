const API_BASE_URL = "/api/routes";

export async function findRoute(
  latitude,
  longitude,
  destination
) {
  const response = await fetch(
    `${API_BASE_URL}/route-pollution?latitude=${latitude}&longitude=${longitude}&destination=${encodeURIComponent(destination)}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch route");
  }

  return await response.json();
}