/** Ensure API base ends with /api (backend routes are under /api/*). */
export function normalizeApiBase(raw) {
  if (!raw) return '/api';
  const trimmed = String(raw).trim();
  if (!trimmed) return '/api';

  if (trimmed === '/api' || trimmed.endsWith('/api')) {
    return trimmed.replace(/\/$/, '');
  }

  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    const base = trimmed.replace(/\/$/, '');
    return base === '/' ? '/api' : `${base}/api`;
  }

  const withoutTrailingSlash = trimmed.replace(/\/$/, '');
  return `${withoutTrailingSlash}/api`;
}

function resolveApiBase() {
  if (typeof window !== 'undefined' && window.__TJ_FMS_API_URL__) {
    return normalizeApiBase(window.__TJ_FMS_API_URL__);
  }
  const fromEnv = import.meta.env.VITE_API_URL;
  if (fromEnv) return normalizeApiBase(fromEnv);
  return '/api';
}

function buildRequestUrl(path, apiBase) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const routePath = normalizedPath.replace(/^\/api/, '') || '/';
  if (apiBase.endsWith('/api')) {
    return `${apiBase}${routePath.startsWith('/') ? routePath : `/${routePath}`}`;
  }
  return `${apiBase}${normalizedPath}`;
}

function getToken() {
  return localStorage.getItem('tj_fms_token');
}

export function getApiBase() {
  return resolveApiBase();
}

export async function api(path, options = {}) {
  const apiBase = resolveApiBase();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const url = buildRequestUrl(path, apiBase);

  let res;
  try {
    res = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err) {
    const hint =
      apiBase === '/api'
        ? 'Set VITE_API_URL on Vercel to your Render API (e.g. https://tj-fms-api.onrender.com/api), or ensure /api proxy rewrites are configured.'
        : `Could not reach ${apiBase}. Check that the API is running and CORS allows this site.`;
    throw new Error(`Network error - ${hint}`);
  }

  const text = await res.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      if (!res.ok) {
        throw new Error(
          res.status === 404
            ? 'API not found. Set VITE_API_URL to your Render API URL with /api suffix.'
            : `Server returned an invalid response (${res.status}). Check API URL configuration.`
        );
      }
      throw new Error('Server returned an invalid response. Check API URL configuration.');
    }
  }

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
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
