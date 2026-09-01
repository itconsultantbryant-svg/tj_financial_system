import { writeFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function normalizeApiUrl(raw) {
  if (!raw) return '';
  const trimmed = String(raw).trim().replace(/\/$/, '');
  if (!trimmed) return '';
  if (trimmed.endsWith('/api')) return trimmed;
  return `${trimmed}/api`;
}

const distDir = join(__dirname, '..', 'dist');
const apiUrl = normalizeApiUrl(process.env.VITE_API_URL);

if (!existsSync(distDir)) {
  console.error('ERROR: dist folder not found. Run vite build first.');
  process.exit(1);
}

if (!apiUrl) {
  console.warn(
    'WARNING: VITE_API_URL is not set. Login will use /api proxy rewrites on Vercel (see vercel.json).'
  );
}

writeFileSync(
  join(distDir, 'api-config.js'),
  `window.__TJ_FMS_API_URL__=${JSON.stringify(apiUrl)};\n`
);

console.log(`api-config.js written (API URL: ${apiUrl || '/api via Vercel proxy'})`);
