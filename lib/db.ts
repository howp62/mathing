import 'server-only';
import fs from 'node:fs';
import path from 'node:path';

/**
 * 데이터베이스 연결.
 * - DATABASE_URL(또는 Vercel이 넣어주는 POSTGRES_URL)이 있으면 그 Postgres(Supabase)에 붙는다.
 * - 없으면 내 컴퓨터 안의 연습용 Postgres(PGlite, .data/pglite)를 쓴다.
 * 두 경우 모두 같은 SQL을 쓴다.
 */
export interface Db {
  query<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T[]>;
}

type Holder = { __mathingDb?: Promise<Db> };
const g = globalThis as unknown as Holder;

export function usingLocalDb() {
  return !(process.env.DATABASE_URL || process.env.POSTGRES_URL);
}

/**
 * 접속 단계(쿼리를 보내기 전)에서 끊긴 경우만 다시 시도한다.
 * 학교 와이파이나 휴대폰 핫스팟처럼 불안정한 망에서 순간적으로 끊기는 것을 견디기 위해서다.
 * 쿼리를 보낸 뒤 끊긴 경우는 같은 쓰기가 두 번 들어갈 수 있어 다시 시도하지 않는다.
 */
const CONNECT_ERROR_CODES = new Set(['CONNECT_TIMEOUT', 'ECONNREFUSED', 'ETIMEDOUT', 'EAI_AGAIN', 'ENOTFOUND', 'EHOSTUNREACH', 'ENETUNREACH']);
function isConnectError(err: unknown) {
  const e = err as { code?: string; message?: string };
  return String(e?.message ?? '').includes('before secure TLS connection') || CONNECT_ERROR_CODES.has(e?.code ?? '');
}
async function withRetry<T>(fn: () => Promise<T>, tries = 3): Promise<T> {
  for (let i = 0; ; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i >= tries - 1 || !isConnectError(err)) throw err;
      await new Promise((r) => setTimeout(r, 300 * (i + 1)));
    }
  }
}

async function createDb(): Promise<{ db: Db; runSchema: (sql: string) => Promise<void> }> {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (url) {
    // IPv6 전용망(휴대폰 핫스팟 등)에서도 IPv4 경로를 먼저 써서 접속을 안정적으로 만든다
    const dns = await import('node:dns');
    dns.setDefaultResultOrder('ipv4first');
    const { default: postgres } = await import('postgres');
    const local = /@(localhost|127\.0\.0\.1)[:/]/.test(url);
    // DATABASE_CA_CERT(Supabase 대시보드에서 받은 인증서 PEM)를 넣으면 서버 인증서까지 확인한다
    const ca = process.env.DATABASE_CA_CERT?.replace(/\\n/g, '\n');
    const ssl = local ? false : ca ? { ca, rejectUnauthorized: true } : 'require';
    if (!local && !ca) console.warn('[db] DATABASE_CA_CERT가 없어 서버 인증서를 확인하지 않고 암호화만 합니다.');
    const sql = postgres(url, { prepare: false, max: 5, idle_timeout: 20, connect_timeout: 15, ssl });
    return {
      db: {
        async query(text, params = []) {
          return (await withRetry(() => sql.unsafe(text, params as never[]))) as unknown as never[];
        },
      },
      runSchema: async (text) => {
        await withRetry(() => sql.unsafe(text));
      },
    };
  }
  const { PGlite } = await import('@electric-sql/pglite');
  const dir = path.join(process.cwd(), '.data', 'pglite');
  fs.mkdirSync(dir, { recursive: true });
  const pg = new PGlite(dir);
  await pg.waitReady;
  return {
    db: {
      async query(text, params = []) {
        const r = await pg.query(text, params as unknown[]);
        return r.rows as never[];
      },
    },
    runSchema: async (text) => {
      await pg.exec(text);
    },
  };
}

export function getDb(): Promise<Db> {
  if (!g.__mathingDb) {
    g.__mathingDb = (async () => {
      const { db, runSchema } = await createDb();
      const schema = fs.readFileSync(path.join(process.cwd(), 'supabase', 'migrations', '20261114000000_init.sql'), 'utf8');
      await runSchema(schema);
      return db;
    })().catch((err) => {
      g.__mathingDb = undefined;
      throw err;
    });
  }
  return g.__mathingDb;
}

export async function q<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T[]> {
  const db = await getDb();
  return db.query<T>(text, params);
}

export async function one<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T | null> {
  const rows = await q<T>(text, params);
  return rows[0] ?? null;
}
