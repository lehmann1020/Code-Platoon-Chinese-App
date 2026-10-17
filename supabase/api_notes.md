# Hanzi Match API notes

Context for Claude (Part II). Every request below was sent to the live Supabase REST API with the publishable key
and returned the status shown. `<id>` values are placeholders.

> **Draft written by Claude from tested requests.** Read it and make sure you can explain each table before you rely on it.

## Setup
- **Base URL:** `https://ootwwoxumqafcjyriuex.supabase.co`. Tables are at `<base_url>/rest/v1/<table>`.
- **Key:** the publishable key (`sb_publishable_…`), in `.env` as `VITE_SUPABASE_PUBLISHABLE_KEY`. Never the secret key.
- **Headers on every request:**
  ```
  apikey: <publishable_key>
  Authorization: Bearer <publishable_key>
  Content-Type: application/json
  ```
- **`Prefer: return=representation`** (writes only): the response body contains the saved row. Without it a POST is
  **201** with an empty body and a DELETE is **204**.
- **Filters** use PostgREST syntax: `?column=eq.value`, several with `&`. **Always filter a PATCH and a DELETE.**
- **Row Level Security** is on for every table. Each table has one TEMPORARY policy, `dev: open access until auth`
  (role `anon`, all operations, `true`). These come out when real auth policies are written.

## The one dev user
No login yet, so the app uses a single seeded user for every row:

| id | name | email |
|---|---|---|
| `74b5ad9e-463c-4a29-a4f0-3ff6181079f6` | Demo Learner | demo@hanzimatch.dev |

`public.users.id` is a foreign key to `auth.users`, so a user row cannot be created through the REST API. The user was
created once in `auth.users`; the `on_auth_user_created` trigger made the `public.users` row, then name/email were set.

## Tables and tested requests

### words (149 rows, shared, read-only for the app)
Columns: `id` uuid, `slug` (`hsk1-001`…, matches the app's old ids), `hanzi`, `pinyin`, `english`, `level` 1–5 (30/30/30/30/29).
```
GET /rest/v1/words?select=slug,hanzi,pinyin,english,level&order=slug         -> 200, 149 rows
GET /rest/v1/words?level=eq.5&select=slug,hanzi&limit=2                      -> 200
GET /rest/v1/words?slug=eq.hsk1-001&select=id                                -> 200
```
Rows are returned in no guaranteed order: add `order=slug`. The default row limit is 1000, so all 149 fit in one request.

### users
```
GET   /rest/v1/users?select=id,name,email                  -> 200
PATCH /rest/v1/users?id=eq.<user_id>   {"name":"..."}      -> 200 (with return=representation)
PATCH /rest/v1/users?id=eq.<user_id>   {"name":"  "}       -> 400, code 23514 (users_name_check: blank name)
```
No POST or DELETE: rows come from the auth trigger. `email` is unique, case-insensitive.

### user_words (words the user has matched)
Primary key is `(user_id, word_id)`, with `word_id` a **uuid** from `words.id`, not the slug.
```
POST   /rest/v1/user_words   {"user_id":"<id>","word_id":"<word uuid>"}          -> 201
GET    /rest/v1/user_words?user_id=eq.<id>&select=word_id,matched_at             -> 200
DELETE /rest/v1/user_words?user_id=eq.<id>&word_id=eq.<word uuid>                -> 200 (with return=representation)
POST same pair twice                                                             -> 409, code 23505 (duplicate key)
POST with a word_id not in words                                                 -> 409, code 23503 (foreign key)
```
"Play again" = `DELETE /rest/v1/user_words?user_id=eq.<id>` (filtered by user only), then a new `game_sessions` row.
The current level is not stored: it is the lowest level that still has unmatched words.

### game_sessions (one row per playthrough)
```
POST  /rest/v1/game_sessions   {"user_id":"<id>"}                                -> 201, started_at defaults to now()
PATCH /rest/v1/game_sessions?id=eq.<session id>   {"completed_at":"<timestamp>"} -> 200
DELETE /rest/v1/game_sessions?id=eq.<session id>                                 -> 204
```
**Tricky:** a CHECK rule requires `completed_at >= started_at` (400, code 23514 otherwise). `started_at` is set by the
server, so send `completed_at` from a clock that is not behind the server (a laptop clock a few minutes slow fails).
Times are `timestamptz`; send ISO 8601 with `Z`.
Finished count (story 6): `GET /rest/v1/game_sessions?user_id=eq.<id>&completed_at=not.is.null&select=id`.

### favorite_words
Primary key `(user_id, word_id)`, same shape as `user_words`.
```
POST   /rest/v1/favorite_words   {"user_id":"<id>","word_id":"<word uuid>"}                       -> 201
GET    /rest/v1/favorite_words?user_id=eq.<id>&select=word_id,words(hanzi,pinyin,english)         -> 200
DELETE /rest/v1/favorite_words?user_id=eq.<id>&word_id=eq.<word uuid>                             -> 204
```
`words(...)` in `select` embeds the joined word through the foreign key.

## Status codes seen
| Code | Meaning here |
|---|---|
| 200 | GET / PATCH worked (and DELETE with `return=representation`) |
| 201 | POST created a row |
| 204 | DELETE worked, no body |
| 400 + `23514` | a CHECK rule failed (blank name, `completed_at` before `started_at`) |
| 409 + `23505` | duplicate primary key |
| 409 + `23503` | foreign key not found |
