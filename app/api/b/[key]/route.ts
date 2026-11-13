import { NextResponse } from 'next/server';
import { boardActivity } from '@/lib/auth';
import { boardView } from '@/lib/views';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, ctx: { params: Promise<{ key: string }> }) {
  const act = await boardActivity((await ctx.params).key);
  if (!act) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json(await boardView(act), { headers: { 'Cache-Control': 'no-store' } });
}
