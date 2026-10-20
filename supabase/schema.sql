-- ============================================================================
-- Hanzi Match schema — v2 (with authentication)
-- Target: the "chinese_app" Supabase project (ootwwoxumqafcjyriuex), PostgreSQL 17.
--
-- STATUS: APPLIED to the database on 2026-10-20 as 4 migrations:
--   auth_01_users, auth_02_tables, auth_02_seed_words (= supabase/seed.sql), auth_03_policies.
-- Kept here as the readable source of truth. The 149 words are in supabase/seed.sql.
-- Pre-auth data backups (single demo user, no login) are in supabase/backups/ and are NOT re-imported.
--
-- DECISIONS:
--   * Supabase Auth, email + password. public.users.id IS the auth.users id; a trigger creates the row,
--     taking name from the sign-up metadata and email from the auth user.
--   * Every user_id column: NOT NULL, DEFAULT auth.uid(), ON DELETE CASCADE. The app never sends a user id.
--   * RLS policies are to `authenticated` only. Logged-out visitors (anon) have no table access at all.
--     - users:                                      read + update (name only) your own row
--     - words:                                      shared reference data, read-only
--     - user_words, game_sessions, favorite_words:  only your own rows (select/insert/update/delete)
--   * TRUNCATE is revoked from API roles (it ignores RLS).
--   * 5 game levels (words.level); saved progress = user_words; the current level is the lowest level
--     that still has unmatched words, so it is not stored. slug keeps the app's ids ('hsk1-001'...).
--   * No database functions are called by the app (no supabase.rpc), so none are defined besides the trigger.
--   * rls_auto_enable() is a project function we did not create; it is not touched here.
--
-- Conventions: snake_case; text (not varchar); timestamptz; uuid ids default gen_random_uuid()
-- (uuidv7() needs PostgreSQL 18; this project is on 17); NOT NULL wherever a value is required;
-- every foreign key has an ON DELETE rule and an index that starts with the FK column.
-- Policies use (select auth.uid()) so Postgres evaluates it once per query, not once per row.
-- ============================================================================


-- ===========================================================================
-- STEP 1 — users (migration auth_01_users)
-- ===========================================================================

-- users — one row per Supabase Auth user. id has NO default: it IS the auth user's id.
create table public.users (
  id         uuid primary key references auth.users (id) on delete cascade,
  name       text,
  email      text,
  created_at timestamptz not null default now(),
  check (name  is null or btrim(name)  <> ''),
  check (email is null or btrim(email) <> '')
);

-- Case-insensitive unique email.
create unique index users_email_lower_key on public.users (lower(email)) where email is not null;

alter table public.users enable row level security;

-- Logged-out visitors get nothing; logged-in users can never create or delete a users row
-- (the trigger creates it, and deleting the auth user cascades).
revoke all on public.users from anon;
revoke insert, delete on public.users from authenticated;

-- Create the public.users row whenever Supabase Auth creates a user.
-- name comes from sign-up metadata: supabase.auth.signUp({ email, password, options: { data: { name } } }).
-- SECURITY DEFINER because the new user has no insert permission; empty search_path so every name is schema-qualified.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (id, name, email)
  values (new.id,
          nullif(btrim(new.raw_user_meta_data ->> 'name'), ''),
          nullif(btrim(new.email), ''));
  return new;
end;
$$;

-- Not callable through the API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ===========================================================================
-- STEP 2 — the other tables (migrations auth_02_tables + auth_02_seed_words)
-- ===========================================================================

-- words — the 149 HSK 1 words, shared reference data. Read-only for logged-in users.
-- slug keeps the app's ids ('hsk1-001'...) so seed + app code line up.
create table public.words (
  id      uuid primary key default gen_random_uuid(),
  slug    text not null unique,
  hanzi   text not null,
  pinyin  text not null,
  english text not null,
  level   smallint not null check (level between 1 and 5),   -- game level (HSK 1 split into 5: 30/30/30/30/29)
  check (btrim(hanzi) <> '' and btrim(pinyin) <> '' and btrim(english) <> '')
);

alter table public.words enable row level security;

revoke all on public.words from anon;
revoke insert, update, delete on public.words from authenticated;

-- Seeded by supabase/seed.sql (migration auth_02_seed_words).


-- user_words — the words a user has matched. One row per (user, word), inserted on a correct match.
--   matched count = count(*) of the user's rows. "Play again" deletes the user's rows.
create table public.user_words (
  user_id    uuid not null default auth.uid() references public.users (id) on delete cascade,
  word_id    uuid not null references public.words (id) on delete cascade,
  matched_at timestamptz not null default now(),
  primary key (user_id, word_id)
);

-- PK covers lookups by user_id; this covers the FK on word_id.
create index user_words_word_id_idx on public.user_words (word_id);

alter table public.user_words enable row level security;

revoke all on public.user_words from anon;


-- game_sessions — one row per playthrough; completed_at set when all 149 words are matched.
create table public.game_sessions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references public.users (id) on delete cascade,
  started_at   timestamptz not null default now(),
  completed_at timestamptz,
  check (completed_at is null or completed_at >= started_at)
);

create index game_sessions_user_id_idx on public.game_sessions (user_id);

alter table public.game_sessions enable row level security;

revoke all on public.game_sessions from anon;


-- favorite_words — words a user has starred.
create table public.favorite_words (
  user_id    uuid not null default auth.uid() references public.users (id) on delete cascade,
  word_id    uuid not null references public.words (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, word_id)
);

create index favorite_words_word_id_idx on public.favorite_words (word_id);

alter table public.favorite_words enable row level security;

revoke all on public.favorite_words from anon;


-- ===========================================================================
-- STEP 3 — RLS policies (migration auth_03_policies)
-- ===========================================================================

-- users: read + update your own row only. Rows are created by the trigger and removed by cascade.
create policy "users: read own row" on public.users
  for select to authenticated
  using ((select auth.uid()) = id);

create policy "users: update own row" on public.users
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Only name can be changed (email comes from auth; id and created_at are fixed).
revoke update on public.users from authenticated;
grant update (name) on public.users to authenticated;


-- words: shared reference data, read-only.
create policy "words: read all" on public.words
  for select to authenticated
  using (true);


-- user_words: own rows only.
create policy "user_words: read own" on public.user_words
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "user_words: insert own" on public.user_words
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "user_words: update own" on public.user_words
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "user_words: delete own" on public.user_words
  for delete to authenticated using ((select auth.uid()) = user_id);


-- game_sessions: own rows only.
create policy "game_sessions: read own" on public.game_sessions
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "game_sessions: insert own" on public.game_sessions
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "game_sessions: update own" on public.game_sessions
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "game_sessions: delete own" on public.game_sessions
  for delete to authenticated using ((select auth.uid()) = user_id);


-- favorite_words: own rows only.
create policy "favorite_words: read own" on public.favorite_words
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "favorite_words: insert own" on public.favorite_words
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "favorite_words: update own" on public.favorite_words
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "favorite_words: delete own" on public.favorite_words
  for delete to authenticated using ((select auth.uid()) = user_id);


-- TRUNCATE skips RLS, so no API role may use it.
revoke truncate on public.users, public.words, public.user_words, public.game_sessions, public.favorite_words
  from anon, authenticated;


-- ===========================================================================
-- Verified 2026-10-20 (two fake users in a rolled-back transaction):
--   A sees own rows (1 match, 149 words, 1 user row), can rename self; email update, adding a word,
--   TRUNCATE all denied. B sees 0 of A's rows and only their own user row; updating/deleting/renaming
--   A's rows affects 0 rows; inserting a row with A's user_id is denied. anon: words denied.
-- ===========================================================================
