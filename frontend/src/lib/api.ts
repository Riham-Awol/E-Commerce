/**
 * Thin API client for the BevSupply backend.
 * When NEXT_PUBLIC_API_URL is not configured the storefront runs entirely on
 * local seed data (see src/data), so every page still renders in isolation.
 */
const BASE = process.env.NEXT_PUBLIC_API_URL;

export const apiEnabled = Boolean(BASE);

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!BASE) throw new Error("API not configured");
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    credentials: "include",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(data) }),
  patch: <T>(path: string, data: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(data) }),
};
