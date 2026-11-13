import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV !== 'production';

// 브라우저가 이 사이트 밖의 스크립트·이미지·연결을 쓰지 못하게 막는 규칙
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  `connect-src 'self'${isDev ? ' ws: wss:' : ''}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  ...(isDev ? [] : [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' }]),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // 바탕화면 폴더가 iCloud와 동기화되면서 개발용 캐시 파일이 복제돼("CURRENT 3" 같은 파일) 서버가 안 켜지는 일이 있어 끈다
  experimental: { turbopackFileSystemCacheForDev: false },
  productionBrowserSourceMaps: false,
  serverExternalPackages: ['@electric-sql/pglite', 'postgres'],
  // 서버가 실행 중에 직접 읽는 파일(예시 카드, 데이터베이스 구조)을 배포 묶음에 꼭 넣는다
  outputFileTracingIncludes: {
    '/**': ['./content/sets/**/*', './supabase/migrations/**/*'],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
