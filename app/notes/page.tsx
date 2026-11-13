import { requireUser } from '@/lib/auth';
import { catalogUnits, notebook, withConcepts } from '@/lib/views';
import { Shell } from '@/components/ui';
import { LogoutButton } from '@/components/LogoutButton';
import { Notes } from './Notes';

export const dynamic = 'force-dynamic';

export default async function NotesPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const user = await requireUser();
  const items = (await notebook(user.id)).map((n) => ({
    ...n,
    first: { answers: withConcepts(n.first.answers, n.first.concepts, n.first.free), free: n.first.free },
    re: n.re ? { answers: withConcepts(n.re.answers, n.re.concepts, n.re.free), free: n.re.free } : null,
  }));
  return (
    <Shell tab="notes">
      <div className="top"><span className="ttl" style={{ fontSize: 18 }}>내 연결 노트</span><span className="right"><LogoutButton /></span></div>
      <Notes items={items} catalog={catalogUnits()} saved={(await searchParams).saved === 're'} />
    </Shell>
  );
}
