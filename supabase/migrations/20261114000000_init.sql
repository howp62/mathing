-- mathing 데이터베이스 구조. 서버가 켜질 때마다 실행되므로 몇 번을 실행해도 같은 결과가 나오게 쓴다.
-- 브라우저는 데이터베이스에 직접 접근하지 않는다. 모든 표에 RLS를 켜고 정책을 두지 않아 서버만 읽고 쓴다.

create table if not exists app_settings (
  key text primary key,
  value text not null
);

-- 학생 계정: 이름·학교·이메일은 받지 않는다
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  nickname text not null,
  password_hash text not null,
  recovery_hash text not null,
  interests jsonb not null default '[]',
  career text not null default '',
  career_unknown boolean not null default false,
  failed_attempts int not null default 0,
  locked_until timestamptz,
  session_version int not null default 0,
  blocked boolean not null default false,
  created_at timestamptz not null default now(),
  last_login_at timestamptz not null default now()
);
create unique index if not exists users_nickname_idx on users (lower(nickname));

-- 연결 글: 학생·단원마다 하나. 처음 글과 다시 쓴 글을 함께 둔다
create table if not exists connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  unit_id text not null,
  interest text not null default '',
  answers jsonb not null,
  concepts jsonb not null default '[]',
  free boolean not null default false,
  re_answers jsonb,
  re_concepts jsonb,
  re_free boolean,
  share boolean not null default true,
  pre smallint check (pre between 1 and 5),
  post smallint check (post between 1 and 5),
  hidden boolean not null default false,
  hidden_reason text,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, unit_id)
);
create index if not exists connections_gallery_idx on connections (unit_id, updated_at desc);

create table if not exists likes (
  connection_id uuid not null references connections(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (connection_id, user_id)
);

create table if not exists reports (
  connection_id uuid not null references connections(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  reason text not null,
  dismissed boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (connection_id, user_id)
);

-- 운영자: 한 명
create table if not exists admins (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  password_hash text not null,
  failed_attempts int not null default 0,
  locked_until timestamptz,
  session_version int not null default 0,
  created_at timestamptz not null default now()
);

-- 도배 막기: 인터넷 주소나 계정을 섞은 값(해시)과 시각만 짧게 둔다
create table if not exists rate_events (
  id bigserial primary key,
  kind text not null,
  key text not null,
  at timestamptz not null default now()
);
create index if not exists rate_events_idx on rate_events (kind, key, at);

-- 이미 만든 표에 나중에 더한 칸
alter table reports add column if not exists dismissed boolean not null default false;

alter table app_settings enable row level security;
alter table users enable row level security;
alter table connections enable row level security;
alter table likes enable row level security;
alter table reports enable row level security;
alter table admins enable row level security;
alter table rate_events enable row level security;
-- 배열 값은 jsonb로 둔다. postgres.js로 보낼 때는 JSON 문자열을 $n::text::jsonb 로 바꾼다(tasks/lessons.md).

-- 운영자 2단계 인증(인증 앱 6자리). 비밀값은 서버에서 암호화해 넣고, 예비 코드는 섞은 값만 둔다
alter table admins add column if not exists totp_secret text;
alter table admins add column if not exists totp_on boolean not null default false;
alter table admins add column if not exists totp_on_at timestamptz;
alter table admins add column if not exists totp_last_step bigint not null default 0;
alter table admins add column if not exists backup_hashes jsonb not null default '[]';

-- 운영자 활동 기록: 접속(로그인·로그아웃·2단계)과 바꾼 것(숨기기·막기·추천). 2년 보관.
-- 글·계정이 지워져도 기록은 남도록 외래 키를 두지 않는다(별명 같은 내용은 적지 않고 번호만 둔다)
create table if not exists admin_log (
  id bigserial primary key,
  admin_id uuid,
  action text not null,
  target_connection uuid,
  target_user uuid,
  ip text,
  at timestamptz not null default now()
);
create index if not exists admin_log_at_idx on admin_log (at desc);
alter table admin_log enable row level security;
