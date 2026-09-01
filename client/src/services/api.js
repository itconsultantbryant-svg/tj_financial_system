function resolveApiBase() {
  if (typeof window !== 'undefined' && window.__TJ_FMS_API_URL__) {
    return window.__TJ_FMS_API_URL__.replace(/\/$/, '');
  }
  const fromEnv = import.meta.env.VITE_API_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  return '/api';
}

const API_BASE = resolveApiBase();

function getToken() {
  return localStorage.getItem('tj_fms_token');
}

export async function api(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = API_BASE.endsWith('/api')
    ? `${API_BASE}${normalizedPath.replace(/^\/api/, '')}`
    : `${API_BASE}${normalizedPath}`;

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export function getApiBase() {
  return API_BASE;
}

export function setAuthToken(token) {
  if (token) localStorage.setItem('tj_fms_token', token);
  else localStorage.removeItem('tj_fms_token');
}

export function clearAuth() {
  localStorage.removeItem('tj_fms_token');
  localStorage.removeItem('tj_fms_user');
  localStorage.removeItem('tj_fms_tenant');
}
