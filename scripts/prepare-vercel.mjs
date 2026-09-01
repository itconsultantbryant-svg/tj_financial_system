import { cpSync, existsSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function normalizeApiUrl(raw) {
  if (!raw) return '';
  const trimmed = String(raw).trim().replace(/\/$/, '');
  if (!trimmed) return '';
  if (trimmed.endsWith('/api')) return trimmed;
  return `${trimmed}/api`;
}

const src = join(root, 'client/dist');
const apiUrl = normalizeApiUrl(process.env.VITE_API_URL);

if (!existsSync(src)) {
  console.error('ERROR: client/dist was not created. Run npm run build -w client first.');
  process.exit(1);
}

if (!apiUrl) {
  console.warn(
    'WARNING: VITE_API_URL is not set. Login will use /api proxy rewrites on Vercel (see vercel.json).'
  );
}

const apiConfig = `window.__TJ_FMS_API_URL__=${JSON.stringify(apiUrl)};\n`;
writeFileSync(join(src, 'api-config.js'), apiConfig);

console.log('Vercel build ready: client/dist');
console.log(`API URL: ${apiUrl || '/api via Vercel proxy'}`);
