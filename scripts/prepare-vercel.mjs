import { cpSync, existsSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'client/dist');
const apiUrl = (process.env.VITE_API_URL || '').replace(/\/$/, '');

if (!existsSync(src)) {
  console.error('ERROR: client/dist was not created. Run npm run build -w client first.');
  process.exit(1);
}

if (!apiUrl) {
  console.warn('WARNING: VITE_API_URL is not set. Set it in Vercel project settings before deploying.');
}

const apiConfig = `window.__TJ_FMS_API_URL__=${JSON.stringify(apiUrl)};\n`;
writeFileSync(join(src, 'api-config.js'), apiConfig);

console.log('Vercel build ready: client/dist');
console.log(`API URL: ${apiUrl || '(not set — configure VITE_API_URL)'}`);
