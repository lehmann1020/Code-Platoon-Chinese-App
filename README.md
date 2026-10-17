# Hanzi Match

A single-page app for practising **HSK 1** Chinese vocabulary. Match each hanzi to its pinyin, six words at a time, until you've matched all 149 words.

**Stack:** React 19 + Vite, React Router DOM (BrowserRouter), plain CSS. Supabase (Postgres) database in `supabase/`. Desktop only. (Until the integration phase lands, the app still keeps its state in memory.)

## Run it
From `front-end/` (copy `.env.example` to `.env` and fill in your Supabase URL and publishable key first):
```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # production build -> dist/
npm run lint         # oxlint
npm run check:data   # validates the HSK 1 word list
npm run check:rounds # simulates 200 full games to check the set-dealing rules
```

## How to play
1. Enter your name and email (kept in memory only).
2. Six hanzi (left) and six pinyin (right) appear, each column shuffled. Click one card, then its partner in the other column. Either order works.
3. **Correct:** both cards explode and a toast shows the definition. **Wrong:** both cards turn red and shake.
4. Match all six to get a **Congratulations** toast; **Continue** deals the next set. The tracker at the bottom shows matched / total.
5. After the last set, a toast says "Congratulations! You've learned all 149 HSK 1 words!"; **Play again** reshuffles and resets.

Keyboard: Tab to a card, Enter or Space to select. Focus moves to the first card of each new set. `prefers-reduced-motion` swaps the shake and explosion for a colour flash.

## Project layout
```
front-end/       the React app (everything below lives in here)
supabase/        schema.sql, seed.sql, user_stories.md, api_notes.md
.claude/         front-end-agent and supabase-agent; .mcp.json at the root

front-end/
app_outline/     specs: user journey, style guide, per-page user stories
docs/            phase plan (phases.md) and the process templates this project was built from
src/
  config/app.js          app name, set size (6)
  data/hsk1.js           the 149 words (hanzi, pinyin with tone marks, English)
  lib/rounds.js          shuffle, deal a set (no repeated pinyin), arrange columns
  state/                 in-memory app state (user, shuffled words, matched ids, current round)
  toast/                 toast provider (definition toasts, persistent congratulations toast)
  components/            Layout, RequireUser (route guard), MatchCard, Tracker
  pages/                 Welcome (/), Play (/play)
scripts/         check-data.mjs, check-rounds.mjs
```

## Notes
- The word list is the classic 150-word HSK 1 list minus 火车站 (left out because I wasn't sure it belongs). It was written from memory, so check it against your source. Two words share pinyin (他/她 tā, 坐/做 zuò); they are never dealt into the same set.
- Red is reserved for wrong matches. Selection and the tracker are blue.

---

# Next: add a Supabase database (do this in a NEW Claude Code session)

This repeats what was done for MyFlix. A finished example to copy from lives in
`/Users/matthewlehmann/Code Platoon/Netflix clone/supabase/` (`schema.sql`, `seed.sql`, the DrawSQL diagram, `user_stories.md`)
and the prompt that was used is in `/Users/matthewlehmann/Code Platoon/Netflix clone/db-prompt.md`.

**Rules for the whole process:** Claude must not create or change anything in Supabase until you approve the written `schema.sql`;
tables are created ONE AT A TIME with a pause after each so you can check the dashboard; you write the Row Level Security
policies yourself; no keys or passwords ever go in this repo.

## Step 1 — Check the global tools are installed (one time per machine)
In a new Claude Code session run `/skills` and `/agents`. You should see:
- skill `postgresql-table-design`
- agent `supabase-agent`

They live in `~/.claude/skills/postgresql-table-design/` and `~/.claude/agents/supabase-agent.md`. If either is missing, copy them from
`/Users/matthewlehmann/Code Platoon/Netflix clone/.claude/` (`skills/postgresql-table-design`, `agents/supabase-agent.md`) into `~/.claude/` and restart Claude.

## Step 2 — Create a Supabase project for Hanzi Match
1. Go to https://supabase.com/dashboard and sign in.
2. **New project.** Use a separate project from MyFlix so the two apps never share a database. Name it **Hanzi Match**, pick a region
   near you, and save the database password somewhere safe (a password manager, NOT this repo).
3. Open the project and copy its **project ref** — the random string in the dashboard URL (`.../dashboard/project/<ref>`).
   It is an identifier, not a secret.

## Step 3 — Connect the Supabase MCP to this folder only
From `/Users/matthewlehmann/Code Platoon/chinese_app` (a *project-scoped* connection, so MyFlix is not affected). Replace `<ref>`:
```bash
claude mcp add --scope project --transport http supabase "https://mcp.supabase.com/mcp?project_ref=<ref>&features=docs%2Caccount%2Cdatabase%2Cdebugging%2Cdevelopment%2Cfunctions%2Cbranching"
```
This writes `.mcp.json` in the project root (it contains only the project ref, no keys). If the command syntax has changed, check the
Supabase MCP docs. Then start Claude in this folder (`claude`), run `/mcp`, choose **supabase**, and complete the browser sign-in.
Confirm it says connected. Make sure it is connected to the **Hanzi Match** project, not MyFlix.

## Step 4 — Write your design inputs (in a `supabase/` folder)
Create `supabase/` in the project root and put in it:
1. **`user_stories.md`** — what users do with the data. Ideas to start from (edit freely):
   - As a learner I want an account with my name and email so my progress is saved.
   - As a learner I want the app to remember which HSK 1 words I have matched.
   - As a learner I want to see how many words I have matched out of the total.
   - (maybe) As a learner I want to see which words I miss most often.
2. **A DrawSQL diagram screenshot** (https://drawsql.app) of the tables you think you need, e.g. `users`, `words` (hanzi, pinyin, english),
   and a table linking users to the words they matched. Save as a PNG (e.g. `supabase/erd.png`).
   You are new to DrawSQL, so it's fine if parts are wrong — Claude's job is to review it and tell you what to fix.

## Step 5 — Start a new Claude Code session and paste this prompt
```text
I'm continuing the Hanzi Match application, an HSK 1 vocabulary matching game (React + Vite, see README.md and app_outline/).
Right now the welcome screen asks for a name and email but everything is kept in memory and resets on refresh. There's no real
login yet; that comes later. I have some resources I'd like you to look at and supervise:

Here is my DrawSQL schema diagram (a screenshot). I'm new using this program so some stuff is probably missing or wrong, tell me
what you would update: @supabase/erd.png

Here are my user stories: @supabase/user_stories.md

My Supabase project is already connected in this directory through the supabase MCP.

Please:
1. Use the postgresql-table-design skill and the Context7 MCP to update your context on the documentation for Supabase and PostgreSQL.
2. Write the SQL schema for my diagram into supabase/schema.sql. Confirm it matches the diagram and the user stories, and list anything
   you'd change to follow database best practices, including Supabase's Row Level Security. Don't change my design on your own: tell me,
   and I'll decide. Then stop so I can review it.
3. After I approve, create the tables in my Supabase project ONE AT A TIME.
4. After each table, pause and tell me what you did so I can verify it in the dashboard before you continue.

Is there any additional information you may need from me?
```
(Optionally add "Use the supabase-agent for this" to the first line.)

## Step 6 — Review and decide
Claude will write `supabase/schema.sql` (as drawn), then list problems and recommendations. Answer its questions. Things that came up
last time and will probably come up again:
- Column types that make no sense (e.g. a `boolean` where an id is needed) and relationship lines drawn the wrong way.
- Missing `NOT NULL`, missing indexes on foreign keys, `varchar` vs `text`, what happens on delete (`ON DELETE CASCADE`).
- Whether data like the HSK words should be one `words` table (hanzi, pinyin, english) and how "matched" is stored per user.
- **Login plan:** anonymous sign-ins now (users get a real id without a login screen) and link `users.id` to `auth.users`.
- Row Level Security: the tables are locked to the app until policies exist. You said you will write the policies.
Then say **"approved"** (or "approved as drawn").

## Step 7 — Check each table as it is created
Claude creates one table per migration and stops. After each one, in the dashboard (https://supabase.com/dashboard → your project):
- **Table Editor** → the table, its columns and row count; the Row Level Security indicator.
- **Database → Triggers** (switch the schema dropdown to `auth` for auth triggers) and **Database → Migrations** to see each `create_..._table`.
- Or **SQL Editor** → run a quick `select count(*) from public.<table>;`.
Reply **"next"** when it looks right.

## Step 8 — Load the data (optional, after the tables exist)
Claude can load the 149 HSK 1 words from `src/data/hsk1.js` into a `words` table by generating the SQL from that file
(so nothing is retyped by hand), matching by name rather than hard-coded ids, and checking the counts against the file.
Ask for `supabase/seed.sql` to be saved in the repo too. Run `npm run check:data` first.

## Step 9 — Things only you can do in the dashboard
1. **Authentication → Sign In / Providers → Anonymous Sign-Ins → enable** (if using anonymous sign-in).
2. **Write the Row Level Security policies** (Authentication → Policies, or SQL Editor). Until you do, the app cannot read or write.
3. **Project Settings → General → rename** the project if you like (the ID never changes).
4. Check **Advisors** (Database → Advisors, or ask Claude to run the security advisor) after every change.

## Step 10 — Commit
- Commit `supabase/schema.sql`, `seed.sql`, the diagram and the user stories (and `.mcp.json` — only the project ref, no keys).
- Before committing run: `git status`, and search for secrets (`service_role`, `password`, `eyJ`). Never commit the database password,
  the **service-role key**, or a `.env` file.
- This repo is **public**: ask Claude to commit first, review, then say "push".

## Later: connecting the React app (a separate step)
When you are ready for the API: use `@supabase/supabase-js`, put the project URL and **publishable (anon) key** in a `.env` file as
`VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` (add `.env` to `.gitignore`), never use the service-role key in front-end code, and
sign the user in anonymously on first visit. Ask Claude to use the Supabase and Context7 docs for the current `supabase-js` calls.
