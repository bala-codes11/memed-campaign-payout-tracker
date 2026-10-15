const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers = new Headers(options.headers);

  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({
    success: false,
    message: "The server returned an invalid response.",
  }));

  if (!response.ok) {
    throw new Error(data.message || `Request failed: ${response.status}`);
  }

  return data as T;
}