import { NextResponse } from 'next/server';
import { currentStudent } from '@/lib/auth';
import { studentState } from '@/lib/studentView';

export const dynamic = 'force-dynamic';

export async function GET() {
  const me = await currentStudent();
  if (!me) return NextResponse.json({ error: 'login' }, { status: 401 });
  return NextResponse.json(await studentState(me), { headers: { 'Cache-Control': 'no-store' } });
}
