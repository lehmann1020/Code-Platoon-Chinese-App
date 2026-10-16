-- ============================================================================
-- Hanzi Match schema — v1 — APPLIED (5 migrations, one per table, 2026-10-15); words seeded via supabase/seed.sql
-- Derived from supabase/user_stories.md and the app's data (src/data/hsk1.js, src/state).
-- Target: the "chinese_app" Supabase project.
--
-- Decisions: 5 game levels (words.level); saved progress = user_words; PostgreSQL 17 (gen_random_uuid ids; uuidv7 needs 18); slug kept; no missed-word tracking (story 4 dropped).
--
-- Row Level Security is ENABLED on every table. No POLICIES are written here
-- (you will add them), so until then the tables are invisible to the API.
--
-- Creation order (one migration per table, pause after each):
--   1. users  (+ trigger creating a row for each new auth user)
--   2. words
--   3. user_words
--   4. game_sessions
--   5. favorite_words
-- ============================================================================

-- 1. users — one row per Supabase Auth user (anonymous now, email later) [story 1]
create table public.users (
  id         uuid primary key references auth.users (id) on delete cascade,
  name       text,
  email      text,
  created_at timestamptz not null default now(),
  check (name  is null or btrim(name)  <> ''),
  check (email is null or btrim(email) <> '')
);

create unique index users_email_lower_key on public.users (lower(email)) where email is not null;

alter table public.users enable row level security;

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (id) values (new.id);
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- 2. words — the 149 HSK 1 words (shared by everyone) [stories 2, 3]
-- slug keeps the app's existing ids ('hsk1-001'...) so seed + app code line up.
create table public.words (
  id      uuid primary key default gen_random_uuid(),
  slug    text not null unique,
  hanzi   text not null,
  pinyin  text not null,
  english text not null,
  level   smallint not null check (level between 1 and 5),   -- game level (HSK 1 split into 5)
  check (btrim(hanzi) <> '' and btrim(pinyin) <> '' and btrim(english) <> '')
);

alter table public.words enable row level security;


-- 3. user_words — the words a user has matched [stories 2, 3]
-- One row per (user, word), inserted when the user matches the word:
--   matched count = count(*) from user_words where user_id = ...   (story 3)
create table public.user_words (
  user_id    uuid not null references public.users (id) on delete cascade,
  word_id    uuid not null references public.words (id) on delete cascade,
  matched_at timestamptz not null default now(),
  primary key (user_id, word_id)
);

-- PK covers lookups by user_id; this covers the FK on word_id.
create index user_words_word_id_idx on public.user_words (word_id);

alter table public.user_words enable row level security;

-- Saved progress: the app loads a user's user_words on return. The current level is the lowest
-- level that still has unmatched words, so it needs no column of its own.


-- 4. game_sessions — one row per playthrough; completed_at set when all 149 words are matched
-- "Start over" in the app closes nothing: it clears the user's user_words and inserts a new session.
create table public.game_sessions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.users (id) on delete cascade,
  started_at   timestamptz not null default now(),
  completed_at timestamptz,
  check (completed_at is null or completed_at >= started_at)
);

create index game_sessions_user_id_idx on public.game_sessions (user_id);

alter table public.game_sessions enable row level security;


-- 5. favorite_words — words a user has starred
create table public.favorite_words (
  user_id    uuid not null references public.users (id) on delete cascade,
  word_id    uuid not null references public.words (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, word_id)
);

create index favorite_words_word_id_idx on public.favorite_words (word_id);

alter table public.favorite_words enable row level security;
