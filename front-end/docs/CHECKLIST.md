# Master Checklist

Work top to bottom. Each step names the folder in this template that gives you the boilerplate.
Tick the boxes in your own copy (copy this file into your project as `docs/CHECKLIST.md`).

## A. UI Fundamentals (planning, no code)  → `01_planning/`
- [ ] A1. Answer the 8-question Practical Template — `01_planning/01_practical_template.md`
- [ ] A2. Identify the app: what / problem / users — same file, section 1
- [ ] A3. Clarify features: goals, information, actions (CRUD matrix) — `01_planning/02_features.md`
- [ ] A4. List what happens when things go wrong — `01_planning/03_error_states.md`
- [ ] A5. Sketch every screen in TLDraw and export PNGs — `01_planning/04_tldraw_wireframing.md`

## B. Format the planning as a project  → `02_app_outline/`
- [ ] B1. Write `user_journey.md` (first visit → primary task → mistake)
- [ ] B2. Write `style_guide.md`
- [ ] B3. Export `app.png` (the whole app on one canvas)
- [ ] B4. One folder per page: wireframe PNG + `user_story.md`
- [ ] B5. (Optional) one folder per reusable component

## C. Prepare Claude Code  → `03_claude_setup/`
- [ ] C1. Node.js + npm installed (`node -v`, `npm -v`)
- [ ] C2. MCP servers added: Context7, Playwright, Chrome DevTools — `mcp_setup.md`
- [ ] C3. Four skills installed in `.claude/skills/` — `install_skills.sh`
- [ ] C4. `/skills` lists all four in a Claude Code session
- [ ] C5. (Optional) front-end sub-agent — `agents/front-end-agent.md`
- [ ] C6. (Optional) project `CLAUDE.md` — `CLAUDE.md.template`

## D. Build  → `04_build_prompt/` and `06_starter_app/`
- [ ] D1. Create the Vite + React project (or copy `06_starter_app/`) — `scripts/new_project.sh`
- [ ] D2. Put `app_outline/` in the project root
- [ ] D3. Fill in the build prompt — `04_build_prompt/build_prompt.md`
- [ ] D4. Claude summarises the journey + lists pages; YOU confirm before any code
- [ ] D5. Agree phases and passing conditions — `04_build_prompt/phase_plan.md`
- [ ] D6. Per phase: build → Playwright screenshot vs wireframe → DevTools console check → you review — `phase_review_log.md`
- [ ] D7. COMMIT after every approved phase

## E. Ship  → `05_git_github/`
- [ ] E1. `.gitignore` in place (node_modules, dist, local tooling)
- [ ] E2. Repo created on GitHub (private until you have checked what is in it)
- [ ] E3. One commit per phase, pushed
- [ ] E4. Final audit: build, lint, Lighthouse, full-journey click-through
