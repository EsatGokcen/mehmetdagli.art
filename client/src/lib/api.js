const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
export const AUTH_EXPIRED = "AUTH_EXPIRED";

let CSRF_TOKEN = null;

async function safe(res) {
  if (res.status === 401) {
    // Session is gone → clear client markers; let UI redirect
    CSRF_TOKEN = null;
    try {
      localStorage.removeItem("authLoginAt");
      localStorage.removeItem("lastActivityAt");
    } catch {}
    throw new Error(AUTH_EXPIRED);
  }
  if (res.ok) {
    // Return JSON or empty on 204
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  }
  const text = await res.text();
  throw new Error(text || res.statusText || "Request failed");
}

export async function refreshCsrf() {
  const res = await fetch(`${API_BASE}/api/auth/csrf`, {
    credentials: "include",
  });
  const data = await res.json();
  CSRF_TOKEN = data.csrf;
  return CSRF_TOKEN;
}

async function ensureCsrf() {
  if (!CSRF_TOKEN) await refreshCsrf();
  return CSRF_TOKEN;
}

export async function get(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...opts,
  });
  return safe(res);
}

export async function post(path, body, opts = {}) {
  const csrf = await ensureCsrf();
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "x-csrf-token": csrf,
      ...(opts.headers || {}),
    },
    body: JSON.stringify(body),
    ...opts,
  });
  return safe(res);
}

export async function put(path, body, opts = {}) {
  const csrf = await ensureCsrf();
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "x-csrf-token": csrf,
      ...(opts.headers || {}),
    },
    body: JSON.stringify(body),
    ...opts,
  });
  return safe(res);
}

export async function del(path, opts = {}) {
  const csrf = await ensureCsrf();
  const res = await fetch(`${API_BASE}${path}`, {
    method: "DELETE",
    credentials: "include",
    headers: { "x-csrf-token": csrf, ...(opts.headers || {}) },
    ...opts,
  });
  return safe(res);
}

export async function login(username, password) {
  const form = new FormData();
  form.append("username", username);
  form.append("password", password);
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    credentials: "include",
    body: form,
  });
  return safe(res);
}

export async function logout() {
  // If not logged in, backend returns ok anyway
  try {
    await ensureCsrf();
  } catch {}
  const res = await fetch(`${API_BASE}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
    headers: CSRF_TOKEN ? { "x-csrf-token": CSRF_TOKEN } : {},
  });
  CSRF_TOKEN = null;
  return safe(res);
}

/** Friendly endpoints */
export const endpoints = {
  artworks: (p = {}) =>
    `/api/portfolio?offset=${p.offset ?? 0}&limit=${p.limit ?? 50}` +
    (p.q ? `&q=${encodeURIComponent(p.q)}` : "") +
    (p.available != null ? `&available=${p.available}` : ""),
  events: (p = {}) =>
    `/api/events?offset=${p.offset ?? 0}&limit=${p.limit ?? 50}` +
    (p.upcoming_only ? `&upcoming_only=true` : "") +
    (p.q ? `&q=${encodeURIComponent(p.q)}` : ""),
};

export async function fetchArtworks(params) {
  return get(endpoints.artworks(params));
}

export async function fetchEvents(params) {
  return get(endpoints.events(params));
}

export { API_BASE };
