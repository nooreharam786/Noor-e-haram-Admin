function normalizeApiUrl(value: string) {
  const trimmed = value.replace(/\/+$/, "");
  try {
    const url = new URL(trimmed);
    if (!url.pathname || url.pathname === "/") {
      url.pathname = "/api";
      return url.toString().replace(/\/+$/, "");
    }
  } catch {
    // Relative URLs are valid in previews; keep them as configured.
  }
  return trimmed;
}

export const API_URL = normalizeApiUrl(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api");

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

export function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("sj_admin_token");
}

export function setToken(token: string) {
  window.localStorage.setItem("sj_admin_token", token);
}

export function clearToken() {
  window.localStorage.removeItem("sj_admin_token");
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (!(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path.startsWith("/") ? path : `/${path}`}`, {
    ...init,
    headers,
    cache: "no-store"
  });

  const payload = (await response.json()) as ApiResponse<T>;
  if (!response.ok || !payload.success) {
    if (response.status === 401) {
      clearToken();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    throw new Error(payload.message ?? "Request failed");
  }

  return payload.data as T;
}

export function toQuery(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  const value = query.toString();
  return value ? `?${value}` : "";
}
