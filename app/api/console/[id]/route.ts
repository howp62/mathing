import { NextResponse } from 'next/server';
import { currentTeacher, teacherActivity } from '@/lib/auth';
import { consoleView } from '@/lib/views';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const teacher = await currentTeacher();
  if (!teacher) return NextResponse.json({ error: 'login' }, { status: 401 });
  const act = await teacherActivity(teacher.id, (await ctx.params).id);
  if (!act) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json(await consoleView(act), { headers: { 'Cache-Control': 'no-store' } });
}
