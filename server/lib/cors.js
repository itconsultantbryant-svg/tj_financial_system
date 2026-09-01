const STATIC_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

export function getAllowedOrigins() {
  const fromEnv = (process.env.CLIENT_URL || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return [...STATIC_ORIGINS, ...fromEnv];
}

export function isOriginAllowed(origin) {
  if (!origin) return true;

  const allowed = getAllowedOrigins();
  if (allowed.includes(origin)) return true;

  try {
    const { hostname } = new URL(origin);
    if (hostname === 'localhost' || hostname === '127.0.0.1') return true;
    if (hostname.endsWith('.vercel.app')) return true;
  } catch {
    return false;
  }

  return false;
}
