// Thin fetch wrapper for the TLV backend. Used by server components and
// client components. Server-side calls use API_URL (private),
// browser calls use NEXT_PUBLIC_API_URL. Both default to localhost:4000.

// Normalise: strip any trailing slash so `${API_BASE}${path}` never produces
// a double slash. Both env vars accept either form; the stripped version
// is canonical.
const RAW_API_BASE =
  (typeof window === "undefined"
    ? process.env.API_URL
    : process.env.NEXT_PUBLIC_API_URL) || "http://localhost:4000";
export const API_BASE = RAW_API_BASE.replace(/\/+$/, "");

// Local storage key for the storefront's JWT. Separate from the admin's
// `luxe_token` so a shared browser session doesn't cross-contaminate.
export const TOKEN_KEY = "tlv:token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Ignore quota/private-mode errors — the user just won't persist across reloads.
  }
}

export function clearToken() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Ignore.
  }
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type RequestOptions = RequestInit & { token?: string; auth?: boolean };

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, auth = true, headers, body, ...rest } = options;

  // Default to pulling the browser token when `auth` isn't explicitly false.
  const bearer = token ?? (auth ? getToken() : null);

  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
      ...headers
    },
    body,
    // Default to no-store for server fetches so content stays fresh; callers
    // can override with { next: { revalidate: 60 } } etc.
    cache: rest.cache ?? "no-store"
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const err = await res.json();
      detail = err.error || detail;
    } catch {
      // non-JSON error body — fall through
    }
    throw new ApiError(res.status, detail);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
