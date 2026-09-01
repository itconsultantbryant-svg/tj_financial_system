import { writeFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist');
const apiUrl = (process.env.VITE_API_URL || '').replace(/\/$/, '');

if (!existsSync(distDir)) {
  console.error('ERROR: dist folder not found. Run vite build first.');
  process.exit(1);
}

if (!apiUrl) {
  console.warn('WARNING: VITE_API_URL is not set. Configure it in Vercel Environment Variables.');
}

writeFileSync(
  join(distDir, 'api-config.js'),
  `window.__TJ_FMS_API_URL__=${JSON.stringify(apiUrl)};\n`
);

console.log(`api-config.js written (API URL: ${apiUrl || 'not set'})`);
