import { notFound, redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { galleryInterests, galleryPage, openSet } from '@/lib/views';
import { Shell } from '@/components/ui';
import { LogoutButton } from '@/components/LogoutButton';
import { Gallery } from './Gallery';

export const dynamic = 'force-dynamic';

export default async function GalleryPage({ params, searchParams }: { params: Promise<{ unitId: string }>; searchParams: Promise<{ saved?: string }> }) {
  const user = await requireUser();
  const set = openSet((await params).unitId);
  if (!set) notFound();
  const page = await galleryPage(user, set.id, 0, null);
  if (!page) redirect(`/u/${set.id}`);
  const tags = await galleryInterests(set.id);
  return (
    <Shell tab="units">
      <div className="top"><a className="back" href="/home" aria-label="단원 목록">‹</a><span className="ttl">{set.unit} · 친구들의 연결</span><span className="right"><LogoutButton /></span></div>
      <Gallery unitId={set.id} initial={page} tags={tags} saved={(await searchParams).saved === '1'} />
    </Shell>
  );
}
