import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import type { ContentSet } from './constants';

import { CATALOG } from './catalog';
export { CATALOG } from './catalog';

const KNOWN = new Set(CATALOG.flatMap((s) => s.units.map((u) => u.id)));
const cache = new Map<string, ContentSet | null>();

export function getSet(id: string): ContentSet | null {
  if (!KNOWN.has(id)) return null;
  if (process.env.NODE_ENV === 'production' && cache.has(id)) return cache.get(id) ?? null;
  let set: ContentSet | null = null;
  try {
    set = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'content', 'sets', `${id}.json`), 'utf8')) as ContentSet;
  } catch {
    set = null;
  }
  cache.set(id, set);
  return set;
}

export function catalogWithAvailability() {
  return CATALOG.map((s) => ({
    subject: s.subject,
    units: s.units.map((u) => {
      const set = getSet(u.id);
      return { ...u, available: !!set, status: set?.status ?? null };
    }),
  }));
}
