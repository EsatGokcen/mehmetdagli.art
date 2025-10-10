const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

let CSRF_TOKEN = null;

export async function refreshCsrf() {
  const res = await fetch(`${API_BASE}/api/auth/csrf`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to get CSRF");
  const data = await res.json();
  CSRF_TOKEN = data.csrf;
  return CSRF_TOKEN;
}

async function ensureCsrf() {
  if (!CSRF_TOKEN) await refreshCsrf();
  return CSRF_TOKEN;
}

async function safe(res) {
  if (res.ok)
    return res.status === 204 ? null : await res.json().catch(() => ({}));
  let msg;
  try {
    const d = await res.json();
    msg = d.detail || d.error || JSON.stringify(d);
  } catch {
    msg = `${res.status} ${res.statusText}`;
  }
  throw new Error(msg);
}

export async function get(path) {
  const res = await fetch(`${API_BASE}${path}`, { credentials: "include" });
  return safe(res);
}

export async function post(path, body) {
  const csrf = await ensureCsrf();
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", "x-csrf-token": csrf },
    body: JSON.stringify(body),
  });
  return safe(res);
}

export async function put(path, body) {
  const csrf = await ensureCsrf();
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json", "x-csrf-token": csrf },
    body: JSON.stringify(body),
  });
  return safe(res);
}

export async function del(path) {
  const csrf = await ensureCsrf();
  const res = await fetch(`${API_BASE}${path}`, {
    method: "DELETE",
    credentials: "include",
    headers: { "x-csrf-token": csrf },
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
  // CSRF rotates on successful login — caller should call refreshCsrf()
  return safe(res);
}

export async function logout() {
  const csrf = await ensureCsrf().catch(() => null); // okay if not logged in
  const headers = csrf ? { "x-csrf-token": csrf } : {};
  const res = await fetch(`${API_BASE}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
    headers,
  });
  CSRF_TOKEN = null;
  return safe(res);
}

export { API_BASE };
