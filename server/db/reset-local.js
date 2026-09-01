import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'data', 'tj_fms.db');

if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('Removed local SQLite database');
}

console.log('Run: npm run db:init && npm run db:seed');
