-- mathing 데이터베이스 구조
-- 앱이 처음 켜질 때 자동으로 실행됩니다. 몇 번을 실행해도 안전하도록 if not exists 를 씁니다.
-- 학생 이름을 넣는 칸은 일부러 없습니다.

create table if not exists app_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

create table if not exists teachers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  password_hash text not null,
  role text not null default 'admin',
  failed_attempts int not null default 0,
  locked_until timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references teachers(id) on delete cascade,
  school_year int not null,
  grade int not null,
  class_no int not null,
  size int not null,
  student_from int not null,
  student_to int not null,
  join_code text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references classes(id) on delete cascade,
  student_no int not null,
  pin_hash text,
  interests jsonb not null default '[]'::jsonb,
  career text not null default '',
  career_unknown boolean not null default false,
  failed_attempts int not null default 0,
  locked_until timestamptz,
  created_at timestamptz not null default now(),
  unique (class_id, student_no)
);

create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references classes(id) on delete cascade,
  set_id text not null,
  stage text not null default 'lobby',
  intro_cards jsonb not null default '[]'::jsonb,
  displayed jsonb not null default '[]'::jsonb,
  opened_at timestamptz not null default now(),
  closed_at timestamptz
);
create index if not exists activities_class_idx on activities(class_id, opened_at desc);

create table if not exists presence (
  activity_id uuid not null references activities(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  state text not null default 'joined',
  updated_at timestamptz not null default now(),
  primary key (activity_id, student_id)
);

create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references activities(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  interest text not null default '',
  answers jsonb not null,
  concepts jsonb not null default '[]'::jsonb,
  free boolean not null default false,
  share_class boolean not null default true,
  share_example boolean not null default false,
  relevance int,
  rating int,
  starred boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (activity_id, student_id)
);

create table if not exists reactions (
  submission_id uuid not null references submissions(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (submission_id, student_id)
);

create table if not exists coach_turns (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references activities(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  step int not null,
  question text not null,
  flagged boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists coach_turns_idx on coach_turns(activity_id, student_id);

create table if not exists ai_usage (
  day date not null,
  class_id uuid not null references classes(id) on delete cascade,
  calls int not null default 0,
  primary key (day, class_id)
);

-- 브라우저에서 Supabase로 직접 읽고 쓰는 길을 막습니다(정책 없이 RLS만 켬).
-- 이 앱의 서버는 표의 주인 계정으로 접속하므로 영향을 받지 않습니다.
alter table app_settings enable row level security;
alter table teachers enable row level security;
alter table classes enable row level security;
alter table students enable row level security;
alter table activities enable row level security;
alter table presence enable row level security;
alter table submissions enable row level security;
alter table reactions enable row level security;
alter table coach_turns enable row level security;
alter table ai_usage enable row level security;

-- 2026-11-13 보안 점검(run-1) 보완
-- 비밀번호를 바꾸거나 초기화하면 이 번호를 올려, 그 전에 발급된 로그인을 모두 끊는다
alter table teachers add column if not exists session_version int not null default 0;
alter table students add column if not exists session_version int not null default 0;
-- 전자칠판은 교사 로그인 없이 수업마다 따로 만든 칠판 주소로 연다
alter table activities add column if not exists board_key text;
create unique index if not exists activities_board_key_idx on activities(board_key);
-- AI 코치 사용 칸(1, 2번)을 먼저 차지해서, 동시에 눌러도 2번을 넘지 못하게 한다
alter table coach_turns add column if not exists slot int;
create unique index if not exists coach_turns_slot_idx on coach_turns(activity_id, student_id, slot);
