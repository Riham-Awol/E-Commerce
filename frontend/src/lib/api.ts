/**
 * API client for the BevSupply backend.
 *
 * The base URL comes from NEXT_PUBLIC_API_URL, which next.config.js sets to
 * "/api" when BACKEND_URL is configured (requests are proxied to the backend).
 * When neither is set the storefront runs entirely on local seed data
 * (see src/data), so every page still renders on its own.
 */
import { useAuth, type AuthUser } from "@/store/auth";

const BASE = process.env.NEXT_PUBLIC_API_URL || "";

export const apiEnabled = Boolean(BASE);

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

interface Options extends RequestInit {
  /** Send the access token, refreshing it first if needed. */
  auth?: boolean;
}

async function rawRequest<T>(path: string, init: Options = {}, token?: string | null): Promise<T> {
  if (!BASE) throw new ApiError("API not configured", 0);
  const { auth: _auth, ...rest } = init;
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(rest.headers ?? {}),
      },
      credentials: "include",
    });
  } catch {
    throw new ApiError("Can't reach the server. Please try again in a moment.", 0);
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const fallback =
      res.status >= 500 ? "The server is unavailable right now. Please try again shortly." : `Request failed (${res.status})`;
    throw new ApiError(body.message ?? fallback, res.status);
  }
  return body as T;
}

let refreshing: Promise<string | null> | null = null;

/** Exchange the httpOnly refresh cookie for a new access token (deduplicated). */
export function refreshAccessToken(): Promise<string | null> {
  refreshing ??= rawRequest<{ accessToken: string }>("/auth/refresh", { method: "POST" })
    .then(({ accessToken }) => {
      useAuth.getState().setAccessToken(accessToken);
      return accessToken;
    })
    .catch(() => {
      useAuth.getState().clear();
      return null;
    })
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

async function request<T>(path: string, init: Options = {}): Promise<T> {
  if (!init.auth) return rawRequest<T>(path, init);

  let token = useAuth.getState().accessToken ?? (await refreshAccessToken());
  if (!token) throw new ApiError("Please sign in to continue.", 401);
  try {
    return await rawRequest<T>(path, init, token);
  } catch (err) {
    if (!(err instanceof ApiError) || err.status !== 401) throw err;
    token = await refreshAccessToken();
    if (!token) throw new ApiError("Your session has expired. Please sign in again.", 401);
    return rawRequest<T>(path, init, token);
  }
}

export const api = {
  get: <T>(path: string, opts?: Options) => request<T>(path, opts),
  post: <T>(path: string, data: unknown, opts?: Options) =>
    request<T>(path, { ...opts, method: "POST", body: JSON.stringify(data) }),
  patch: <T>(path: string, data: unknown, opts?: Options) =>
    request<T>(path, { ...opts, method: "PATCH", body: JSON.stringify(data) }),
};

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export async function login(email: string, password: string) {
  const res = await api.post<AuthResponse>("/auth/login", { email, password });
  useAuth.getState().setSession(res.user, res.accessToken);
  return res.user;
}

export async function register(name: string, email: string, password: string, phone?: string) {
  const res = await api.post<AuthResponse>("/auth/register", { name, email, password, phone: phone || undefined });
  useAuth.getState().setSession(res.user, res.accessToken);
  return res.user;
}

export async function logout() {
  try {
    await api.post("/auth/logout", {});
  } finally {
    useAuth.getState().clear();
  }
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export interface PlaceOrderInput {
  items: { slug: string; quantity: number }[];
  paymentMethod: string;
  fulfilment: "delivery" | "pickup";
  deliveryAddress?: string;
  deliveryDate?: string;
  notes?: string;
  couponCode?: string;
}

export interface PlacedOrder {
  id: number;
  reference: string;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status: string;
}

export function placeOrder(input: PlaceOrderInput) {
  return api.post<{ order: PlacedOrder }>("/orders", input, { auth: true }).then((r) => r.order);
}

export interface ApiOrder {
  id: number;
  reference: string;
  status: string;
  subtotal: number;
  tax: number;
  delivery_fee: number;
  discount: number;
  total: number;
  payment_method: string | null;
  payment_status: string;
  fulfilment: string;
  delivery_address: string | null;
  delivery_date: string | null;
  created_at: string;
  items: { product_name: string; unit_price: number; quantity: number }[];
}

export function fetchMyOrders() {
  return api.get<{ data: ApiOrder[] }>("/orders", { auth: true }).then((r) => r.data);
}

export interface ApiMe {
  id: number;
  name: string;
  email: string;
  role: string;
  reward_points: number;
  credit_limit: number;
}

export function fetchMe() {
  return api.get<{ user: ApiMe }>("/auth/me", { auth: true }).then((r) => r.user);
}

// ---------------------------------------------------------------------------
// Payments (Stripe Checkout)
// ---------------------------------------------------------------------------

/** Whether the backend has Stripe configured for card payments. */
export function fetchPaymentConfig() {
  return api.get<{ card: boolean }>("/payments/config").then((r) => r.card);
}

/** Create a Stripe Checkout session for an order and send the browser to it. */
export async function startCardPayment(reference: string) {
  const { url } = await api.post<{ url: string }>("/payments/checkout-session", { reference }, { auth: true });
  window.location.assign(url);
}

export function confirmCardPayment(sessionId: string) {
  return api.post<{ reference: string; paid: boolean; total: number }>(
    "/payments/confirm",
    { sessionId },
    { auth: true },
  );
}
