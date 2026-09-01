import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import { neon } from '@neondatabase/serverless';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATABASE_URL = process.env.DATABASE_URL;

let sqliteDb = null;
let neonSql = null;
let driver = 'sqlite';

if (process.env.NODE_ENV === 'production' && !DATABASE_URL) {
  console.error('FATAL: DATABASE_URL is required in production (Neon PostgreSQL).');
  process.exit(1);
}

if (DATABASE_URL) {
  neonSql = neon(DATABASE_URL);
  driver = 'postgres';
} else {
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const dbPath = path.join(dataDir, 'tj_fms.db');
  sqliteDb = new Database(dbPath);
  sqliteDb.pragma('journal_mode = WAL');
  sqliteDb.pragma('foreign_keys = ON');
}

function adaptSql(sql) {
  if (driver === 'postgres') {
    return sql.replace(/datetime\('now'\)/g, 'NOW()');
  }
  return sql;
}

function adaptParams(sql, params) {
  if (driver !== 'postgres') return { sql, params };
  let i = 0;
  const adaptedSql = sql.replace(/\?/g, () => `$${++i}`);
  return { sql: adaptedSql, params };
}

export function getDriver() {
  return driver;
}

export function toDbBool(value) {
  if (driver === 'postgres') return Boolean(value);
  return value ? 1 : 0;
}

export async function run(sql, params = []) {
  const adapted = adaptSql(sql);
  const { sql: finalSql, params: finalParams } = adaptParams(adapted, params);
  if (driver === 'postgres') {
    return neonSql(finalSql, finalParams);
  }
  return sqliteDb.prepare(adapted).run(...params);
}

export async function get(sql, params = []) {
  const adapted = adaptSql(sql);
  const { sql: finalSql, params: finalParams } = adaptParams(adapted, params);
  if (driver === 'postgres') {
    const rows = await neonSql(finalSql, finalParams);
    return rows[0] || null;
  }
  return sqliteDb.prepare(adapted).get(...params) || null;
}

export async function all(sql, params = []) {
  const adapted = adaptSql(sql);
  const { sql: finalSql, params: finalParams } = adaptParams(adapted, params);
  if (driver === 'postgres') {
    return await neonSql(finalSql, finalParams);
  }
  return sqliteDb.prepare(adapted).all(...params);
}

export async function exec(sql) {
  const statements = sql.split(';').filter((s) => s.trim());
  for (const stmt of statements) {
    if (stmt.trim()) {
      await run(stmt);
    }
  }
}

export function getSqliteDb() {
  return sqliteDb;
}
