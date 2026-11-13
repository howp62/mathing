import { notFound, redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { myConnection, openSet } from '@/lib/views';
import { Plain } from '@/components/ui';
import { UnitFlow } from './UnitFlow';

export const dynamic = 'force-dynamic';

export default async function UnitPage({ params, searchParams }: { params: Promise<{ unitId: string }>; searchParams: Promise<{ re?: string }> }) {
  const user = await requireUser();
  const { unitId } = await params;
  const set = openSet(unitId);
  if (!set) notFound();
  const mine = await myConnection(user.id, set.id);
  const rewrite = (await searchParams).re === '1';
  if (mine && !rewrite) redirect(`/u/${set.id}/gallery`);
  if (!mine && rewrite) redirect(`/u/${set.id}`);
  return (
    <Plain>
      <UnitFlow
        userKey={user.id.slice(0, 8)}
        set={{ id: set.id, subject: set.subject, unit: set.unit, concepts: set.concepts, thinkCards: set.thinkCards, examples: set.examples }}
        profile={{ interests: user.interests, career: user.career, careerUnknown: user.career_unknown }}
        rewrite={rewrite && mine ? { answers: mine.re_answers ?? mine.answers, free: mine.re_answers ? !!mine.re_free : mine.free, concepts: mine.re_concepts ?? mine.concepts, share: mine.share, interest: mine.interest } : null}
      />
    </Plain>
  );
}
