import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec, getDriver } from './adapter.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function init() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  let schema = fs.readFileSync(schemaPath, 'utf8');

  if (getDriver() === 'postgres') {
    schema = schema.replace(/datetime\('now'\)/g, 'NOW()');
  }

  const dataDir = path.join(__dirname, '..', 'data');
  if (getDriver() === 'sqlite' && !fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  await exec(schema);
  console.log(`Database initialized (${getDriver()})`);
}

init().catch((err) => {
  console.error('Init failed:', err);
  process.exit(1);
});
