import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import QRCode from 'qrcode';
import { boardActivity } from '@/lib/auth';
import { boardView } from '@/lib/views';
import { Board } from './Board';

export const dynamic = 'force-dynamic';

/** 전자칠판 화면. 교사 로그인 없이, 수업마다 따로 만든 칠판 주소로만 연다(학번·평가는 이 화면에 오지 않는다). */
export default async function BoardPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const act = await boardActivity(key);
  if (!act) notFound();
  const data = await boardView(act);
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') || host.startsWith('127.') ? 'http' : 'https');
  const joinUrl = `${proto}://${host}/j/${data.joinCode}`;
  const qr = await QRCode.toString(joinUrl, { type: 'svg', margin: 1, errorCorrectionLevel: 'M', color: { dark: '#1D2129', light: '#FFFFFF' } });
  return <Board initial={data} boardKey={key} qrSvg={qr} joinUrl={joinUrl} />;
}
