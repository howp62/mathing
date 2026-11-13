import { notFound } from 'next/navigation';
import { requireTeacher, teacherActivity } from '@/lib/auth';
import { consoleView } from '@/lib/views';
import { ensureBoardKey } from '@/app/actions/teacher';
import { Console } from './Console';
import { rehearsalAllowed } from '@/lib/rehearsal';

export const dynamic = 'force-dynamic';

export default async function ActivityPage({ params }: { params: Promise<{ id: string }> }) {
  const teacher = await requireTeacher();
  const act = await teacherActivity(teacher.id, (await params).id);
  if (!act) notFound();
  if (!act.board_key) act.board_key = await ensureBoardKey(act.id);
  return <Console initial={await consoleView(act)} rehearsal={rehearsalAllowed()} />;
}
