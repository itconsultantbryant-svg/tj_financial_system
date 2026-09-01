/**
 * One-time Neon production setup: schema + seed + Liberia/USD patch.
 * Usage: DATABASE_URL='postgresql://...' node db/provision-neon.js
 */
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.join(__dirname, '..');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

const run = (script) => {
  console.log(`Running ${script}...`);
  execSync(`node ${script}`, {
    cwd: serverRoot,
    stdio: 'inherit',
    env: process.env,
  });
};

run('db/init.js');
run('db/seed.js');
run('db/patch-usd.js');
console.log('Neon provision complete.');
