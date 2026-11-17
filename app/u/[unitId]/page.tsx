import { notFound, redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { isOpen, myConnection, openSet } from '@/lib/views';
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
  // 관심사 맞춤 질문은 세트와 따로 검수한다. 검수 전(draft)이면 실제 사이트에서는 넘기지 않는다(세트 공개와 같은 규칙)
  const prompts: Record<string, string> = isOpen(set.interestPromptsStatus ?? 'draft') ? { ...set.interestPrompts } : {};
  return (
    <Plain>
      <UnitFlow
        userKey={user.id.slice(0, 8)}
        set={{ id: set.id, subject: set.subject, unit: set.unit, concepts: set.concepts, thinkCards: set.thinkCards, interestPrompts: prompts, examples: set.examples }}
        profile={{ interests: user.interests, career: user.career, careerUnknown: user.career_unknown }}
        rewrite={rewrite && mine ? { answers: mine.re_answers ?? mine.answers, free: mine.re_answers ? !!mine.re_free : mine.free, concepts: mine.re_concepts ?? mine.concepts, share: mine.share, interest: mine.interest } : null}
      />
    </Plain>
  );
}
