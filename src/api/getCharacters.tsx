export async function fetchCharacters(
  controller?: AbortController
): Promise<any> {
  const response = await fetch("https://dummyjson.com/users", {
    signal: controller?.signal,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch characters");
  }
  const results = await response.json();

  return results.users;
}
