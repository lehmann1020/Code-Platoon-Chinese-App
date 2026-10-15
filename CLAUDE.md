# Hanzi Match

React + Vite single-page app, React Router DOM (BrowserRouter). Front-end only: no API calls;
all state is in memory and resets on refresh.

## Where things are
- `app_outline/` — user_journey.md, style_guide.md, app.png, pages/<page>/{user_story.md, wireframe.png}
- `src/pages`, `src/components`, `src/state`, `src/data`, `src/config/app.js`
- Optional copy-in patterns (carousel, favourites, onboarding guard…) are not part of the starter

## Rules
- Read the relevant page's `user_story.md` and wireframe before changing a page.
- Use Context7 for library docs. Use Playwright to screenshot and compare to wireframes. Use Chrome DevTools for console/Lighthouse.
- Desktop only (no mobile layouts or tests).
- Work in phases (see `docs/phases.md`); stop after each phase for my approval. After I approve, COMMIT (message names the phase) and ask me before the first push / creating the GitHub repo; afterwards push each approved phase.
- Keep screenshots in `.playwright-mcp/` (git-ignored).
- Run `npm run lint` and `npm run build` before calling a phase done.
