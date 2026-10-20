# Hanzi Match API notes

How to call the Hanzi Match Supabase API now that it has real logins. Every request below was sent to the live
Supabase API (Auth + REST) and returned the status shown. IDs are placeholders (`<id>`).

> **Draft written by Claude from tested requests.** Read it and make sure you can explain each table before you rely on it.

## Postman collection
`supabase/hanzi_match.postman_collection.json` has every request below: **56 requests and 111 checks in 9 folders**.
Import it in Postman, set the collection variable `publishable_key`, and run it with the Collection Runner, in order.

- Folder **0 Auth** signs up two test accounts (`hm-postman-a@hanzimatch.dev`, `hm-postman-b@hanzimatch.dev`) or reuses
  them if they already exist, logs both in, and saves `access_token` / `user_id` (user A) and `access_token_b` /
  `user_id_b` (user B). Every table request after that sends a user's token.
- Folder **6 Isolation** uses user B's token against user A's rows.
- Folder **8 Cleanup** deletes the rows the run created and logs both users out. The two test accounts stay in
  **Authentication → Users**, because the publishable key can't delete accounts. Delete them there if you want a clean list.
- Run end to end with newman against the live database twice on 2026-10-20 (the first run created the accounts, the
  second reused them): **56/56 requests and 111/111 checks passed** both times.
- Needs **Confirm email OFF** (Authentication → Sign In / Providers → Email). With it on, sign-up returns no token.

## Setup
- **Base URL:** `{{base_url}}` = `https://ootwwoxumqafcjyriuex.supabase.co`.
  Auth lives at `{{base_url}}/auth/v1/…`, tables at `{{base_url}}/rest/v1/<table>`.
- **Key:** the publishable key (`sb_publishable_…`): `VITE_SUPABASE_PUBLISHABLE_KEY` in `front-end/.env`, the Postman
  variable `publishable_key`. Never the secret key.
- **Headers on every table request:**
  ```
  apikey: <publishable_key>
  Authorization: Bearer <access_token>
  Content-Type: application/json
  ```
  `apikey` says which project; the **access token** says *who you are*. Its `role` claim is `authenticated` and its `sub`
  claim is your user id: that is what `auth.uid()` returns inside the database.
- **Logged out** (only `apikey`, no `Authorization`): you are the `anon` role, which has **no access to any table** → 401.
- **`Authorization` must hold a real access token.** A broken value gives 401 `PGRST301 Expected 3 parts in JWT; got 1`.
- **Never send `user_id`.** Every `user_id` column defaults to `auth.uid()`; RLS rejects any other id (403).
- **`Prefer: return=representation`** (writes only): the response body contains the saved row(s). Without it a POST is
  **201** and a PATCH / DELETE is **204**, all with an empty body.
- **Filters** use PostgREST syntax: `?column=eq.value`, several with `&`. **Always filter a PATCH and a DELETE.**
  They apply to every row that matches the filter and that RLS lets you see.
- **Tokens expire after 1 hour** (`expires_in: 3600`). supabase-js refreshes them automatically; in Postman, log in again.

## Auth requests
| Action | Request | Result |
|---|---|---|
| Sign up | `POST /auth/v1/signup` `{"email":"…","password":"…","data":{"name":"Ava"}}` | 200 with `access_token`, `refresh_token`, `expires_in: 3600`, `user` |
| Sign up, email already used | same | 422 `user_already_exists` (`User already registered`) |
| Sign up, password under 6 characters | same | 422 `weak_password` |
| Log in | `POST /auth/v1/token?grant_type=password` `{"email":"…","password":"…"}` | 200, same shape as sign up |
| Log in, wrong password | same | 400 `invalid_credentials` (`Invalid login credentials`) |
| Who am I? | `GET /auth/v1/user` (with the token) | 200, the user (`id`, `email`, `role: authenticated`) |
| Log out | `POST /auth/v1/logout` (with the token) | 204 |
| Who am I? after log out | `GET /auth/v1/user` (old token) | 403 `session_not_found` |

Auth requests send only `apikey` (plus `Authorization` for "who am I" and log out).
`data.name` on sign-up goes into the user's metadata; the `on_auth_user_created` trigger copies it into `public.users.name`
(and the auth email into `public.users.email`).

**Log out revokes the session, not the JWT.** After log out, Auth rejects the old token (403 above), but table requests
still accept it until it expires (at most 1 hour), because PostgREST only checks the token's signature and expiry.
The app deletes its copy of the token on log out.

## Who can do what (Row Level Security)
RLS is on for every table, and every policy is **to `authenticated`**, using `(select auth.uid())`. There are no `anon`
policies and no grants for `anon`. `TRUNCATE` is revoked from both API roles (it would skip RLS).

| Table | Logged-in user can | How |
|---|---|---|
| `words` | read all 149 rows | SELECT policy `using (true)`; no INSERT/UPDATE/DELETE grant |
| `users` | read and update **their own row**, `name` only | policies `auth.uid() = id`; column grant `update (name)`; no INSERT/DELETE grant |
| `user_words` | select / insert / update / delete **their own rows** | policies `auth.uid() = user_id` (with `with check` on insert/update) |
| `game_sessions` | same, own rows | same |
| `favorite_words` | same, own rows | same |

What a blocked request looks like:
| Situation | Result |
|---|---|
| Reading another user's rows (with or without a filter for their id) | **200 `[]`**: the rows are invisible, not an error |
| PATCH / DELETE another user's rows | **200 `[]`** (with `return=representation`): 0 rows changed |
| INSERT with someone else's `user_id` | **403** `42501` `new row violates row-level security policy for table "…"` |
| Writing to `words`, POST/DELETE on `users`, PATCH `users.email` | **403** `42501` `permission denied for table …` |
| Any table while logged out | **401** `42501` `permission denied for table …` |

## Tables and tested requests
All with the logged-in user's token (headers above).

### words (149 rows, shared, read-only)
Columns: `id` uuid, `slug` (`hsk1-001`…, the app's word ids), `hanzi`, `pinyin`, `english`, `level` 1–5 (30/30/30/30/29).
```
GET    /rest/v1/words?select=slug,hanzi,pinyin,english,level&order=slug      -> 200, 149 rows
GET    /rest/v1/words?level=eq.5&select=slug,hanzi                            -> 200, 29 rows
GET    /rest/v1/words?slug=eq.hsk1-001&select=id                              -> 200, 1 row
POST   /rest/v1/words  {...}                                                  -> 403, 42501
PATCH  /rest/v1/words?slug=eq.hsk1-001  {"english":"changed"}                 -> 403, 42501
DELETE /rest/v1/words?slug=eq.hsk1-001                                        -> 403, 42501
```
Rows come back in no guaranteed order: add `order=slug`. The default row limit is 1000, so all 149 fit in one request.
Re-seeded from `supabase/seed.sql`, so the uuids changed in the auth migration; look them up by `slug`.

### users (your own row)
Columns: `id` (= the auth user id), `name`, `email`, `created_at`. Rows are created by the sign-up trigger.
```
GET    /rest/v1/users?select=id,name,email                   -> 200, 1 row (yours; no filter needed)
GET    /rest/v1/users?id=eq.<other user's id>                -> 200, []
PATCH  /rest/v1/users?id=eq.<my id>  {"name":"..."}          -> 200 (return=representation) / 204
PATCH  /rest/v1/users?id=eq.<my id>  {"name":"   "}          -> 400, 23514 (users_name_check: blank name)
PATCH  /rest/v1/users?id=eq.<my id>  {"email":"..."}         -> 403, 42501 (only name is editable)
POST   /rest/v1/users  {...}                                 -> 403, 42501
DELETE /rest/v1/users?id=eq.<my id>                          -> 403, 42501
```

### user_words (words the user has matched)
Primary key `(user_id, word_id)`; `word_id` is a **uuid** from `words.id`, not the slug.
```
POST   /rest/v1/user_words  {"word_id":"<word uuid>"}                       -> 201, user_id filled in from the token
GET    /rest/v1/user_words?select=word_id,matched_at                       -> 200, my rows only
GET    /rest/v1/user_words?select=matched_at,words(slug,hanzi,pinyin)      -> 200, with the matched word embedded
POST   same word twice                                                      -> 409, 23505 (duplicate key; the app ignores it)
POST   {"word_id":"<uuid not in words>"}                                    -> 409, 23503 (foreign key)
POST   {"user_id":"<someone else>","word_id":"..."}                         -> 403, 42501 (RLS with check)
DELETE /rest/v1/user_words?user_id=eq.<my id>                               -> 200 (return=representation), "Play again"
```
The current level is not stored: it is the lowest level that still has unmatched words.

### game_sessions (one row per playthrough)
```
POST  /rest/v1/game_sessions  {}                                            -> 201, started_at = now(), user_id from the token
GET   /rest/v1/game_sessions?completed_at=is.null&order=started_at.desc&limit=1   -> 200, my open session
PATCH /rest/v1/game_sessions?id=eq.<session id>  {"completed_at":"<ts>"}   -> 200
PATCH ... {"completed_at":"2000-01-01T00:00:00Z"}                           -> 400, 23514 (game_sessions_check)
GET   /rest/v1/game_sessions?completed_at=not.is.null&select=id             -> 200, finished playthroughs
```
**Tricky:** the CHECK rule requires `completed_at >= started_at`, and `started_at` is set by the server. Send a
`completed_at` that is not before the server's `started_at` (the app uses `max(now, started_at)`; the collection uses
`started_at + 1 s`). Times are `timestamptz`; send ISO 8601 with `Z`.

### favorite_words
Primary key `(user_id, word_id)`, same shape as `user_words`. (Not used by the app yet.)
```
POST   /rest/v1/favorite_words  {"word_id":"<word uuid>"}                                  -> 201
GET    /rest/v1/favorite_words?select=created_at,words(hanzi,pinyin,english)               -> 200
DELETE /rest/v1/favorite_words?user_id=eq.<my id>&word_id=eq.<word uuid>                   -> 200 / 204
POST   {"user_id":"<someone else>","word_id":"..."}                                        -> 403, 42501
```

## Status codes seen
| Code | Meaning here |
|---|---|
| 200 | GET / PATCH worked (and DELETE with `return=representation`); also `[]` when RLS hides every row |
| 201 | POST created a row |
| 204 | PATCH / DELETE without `return=representation`; log out |
| 400 + `23514` | a CHECK rule failed (blank name, `completed_at` before `started_at`) |
| 400 `invalid_credentials` | wrong email or password |
| 401 + `42501` | logged out (no token): anon has no table access |
| 401 + `PGRST301` | the `Authorization` header isn't a valid JWT |
| 403 + `42501` | no grant for that action, or RLS `with check` rejected the row |
| 403 `session_not_found` | Auth request with a token whose session was logged out |
| 409 + `23505` | duplicate primary key |
| 409 + `23503` | foreign key not found |
| 422 | sign-up: `user_already_exists` or `weak_password` |
