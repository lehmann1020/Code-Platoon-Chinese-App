# Hanzi Match

Full-stack: a React + Vite single-page app (`front-end/`, React Router DOM with BrowserRouter) backed by a
Supabase Postgres database (`supabase/`). The app talks to Supabase's REST API with the publishable key.

## Layout
- `front-end/` — the React app: `src/{pages,components,state,data,lib,config}`, `app_outline/`, `docs/`, `scripts/`, `.env`
  - `app_outline/` — user_journey.md, style_guide.md, app.png, pages/<page>/{user_story.md, wireframe.png}
- `supabase/` — schema.sql, seed.sql, user_stories.md, api_notes.md (tested requests per table),
  hanzi_match.postman_collection.json, backups/ (pre-auth CSVs)
- `.claude/agents/` — front-end-agent, supabase-agent; `.mcp.json` — Supabase MCP server

## Rules (both halves)
- Work in phases (see `front-end/docs/phases.md`); stop after each phase for my approval. After I approve, COMMIT (message names the phase) and push.
- Run `npm run lint` and `npm run build` in `front-end/` before calling a phase done.
- Keep screenshots in `.playwright-mcp/` (git-ignored). Never commit `.env`.

## Front-end rules
- Read the relevant page's `user_story.md` and wireframe before changing a page.
- Use Context7 for library docs. Use Playwright to screenshot and compare to wireframes. Use Chrome DevTools for console/Lighthouse.
- Desktop only (no mobile layouts or tests).
- Keys come from `import.meta.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`). Publishable key only, never the secret key.

## Back-end rules
- Read `supabase/api_notes.md` before writing any request; the database is the source of truth.
- **Authentication is done** (Supabase Auth, email + password): Register, Log in, Log out, session recovery on refresh.
  There is no demo user and no `dev:` policy; do not recreate them. "Confirm email" is OFF for development.
- `users.id` is the `auth.users` id; the `on_auth_user_created` trigger creates the row (name from sign-up metadata).
  Every `user_id` column is `not null default auth.uid()` with `on delete cascade`; the app never sends a user id.
- RLS policies are to `authenticated` only, using `(select auth.uid())`. Per-user tables (`user_words`, `game_sessions`,
  `favorite_words`) allow only the owner's rows; `words` is read-only; `users` is read + update own row (name only).
- Do not change RLS, tables or data without my approval. (The one-time auth migration is done; pre-auth CSV backups
  are in `supabase/backups/` and are not re-imported.)
- Test requests: `supabase/hanzi_match.postman_collection.json` (run in order; it signs up/reuses two test accounts).
- Use the Supabase MCP for schema and SQL; record schema changes in `supabase/schema.sql`.
