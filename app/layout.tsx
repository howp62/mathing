import type { Metadata, Viewport } from 'next';
import { Gowun_Batang } from 'next/font/google';
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css';
import './globals.css';

// 제목 글꼴(고운바탕, OFL). 빌드할 때 받아 이 사이트에서 직접 내보내므로 학생 브라우저가 구글에 요청하지 않는다.
// 한글 글자는 필요한 조각만 그때그때 받는다(preload는 영문 조각만).
const display = Gowun_Batang({ weight: ['400', '700'], subsets: ['latin'], display: 'swap', variable: '--font-display' });

export const metadata: Metadata = {
  title: 'mathing',
  description: '수학과 나를 잇는 시간',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#F7F2E8' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={display.variable}>
      <body>{children}</body>
    </html>
  );
}
