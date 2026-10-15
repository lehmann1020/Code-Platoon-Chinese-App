# Hanzi Match — Build Phases

**Status:** all phases (0–6) built and approved.
The word list ended at 149 words (火车站 removed), so there are 25 sets (24 of 6, one of 5).

Each phase ends with Playwright/DevTools verification and **your approval**. After approval: commit (message names the phase), push after the first-push confirmation.
Desktop only. Evidence (screenshots) goes in `.playwright-mcp/` (git-ignored).

| # | Phase | Deliverable | Passing conditions |
|---|---|---|---|
| 0 | Scaffold | Replace the template's CRUD starter with Hanzi Match's shell: Vite + React Router (BrowserRouter), in-memory state provider (user, words, progress), design tokens + fonts from the style guide, `/` and `/play` routes, guard that redirects `/play` to `/` when there is no user | `npm run build` + `npm run lint` clean; both routes render; `/play` redirects to `/` before sign-in; unknown URL redirects to `/`; refresh resets state; Noto Serif SC and tone marks render (visual check) |
| 1 | HSK 1 data | `src/data/hsk1.js` — about 150 words `{id, hanzi, pinyin (tone marks), english}`; a verification script `scripts/check-data.mjs` | Script reports the word count, no duplicate ids or hanzi, no empty fields, every pinyin uses tone marks (or is a neutral-tone syllable); set builder can always produce sets with no repeated pinyin; you spot-check the list and tell me what to fix |
| 2 | Welcome screen | Name + email form per the wireframe | Screenshot matches wireframe; blank/invalid shows errors; button disabled until valid; submit goes to `/play` with the name stored; Enter submits; first field focused |
| 3 | Board + tracker | Play page layout: two shuffled columns of 6 cards, selection logic (either column first), header greeting, bottom tracker `0 / total` | Screenshot matches wireframe; columns shuffled independently; click selects/deselects/moves selection within a column; two cards from opposite columns trigger an evaluation hook (no feedback yet); tracker pinned and showing the real total from the data file |
| 4 | Match feedback | Correct: card explosion + definition toast + tracker +1. Wrong: red + shake, reset | Correct pair explodes, disappears, toast shows hanzi/pinyin/English, tracker increments; wrong pair turns red and shakes ~450ms then resets without changing the tracker; clicks during animations ignored; toasts stack (max 3) and auto-dismiss; verified for hanzi-first and pinyin-first |
| 5 | Sets and completion | Congratulations toast with Continue; next set of 6 until all words are done; final partial set; completion + Play again | After 6 matches the toast appears (Continue focused) and stays; Continue shows the next 6 unmatched words; tracker totals correct across sets; final set shows the remaining cards; after the last match: completion toast + Play again resets progress and reshuffles; a scripted run matches every word and ends at `total / total` |
| 6 | Polish + audit | Motion tuning, reduced-motion fallbacks, keyboard operation, aria-live toasts, Lighthouse | 0 console errors through a full playthrough; whole game playable by keyboard only; `prefers-reduced-motion` removes shake/explosion movement; Lighthouse (desktop) Accessibility and Best Practices >= 95; build + lint clean |

## Rules
1. I build one phase, verify it, and report honestly (including anything I did not check).
2. You review and say "approved" or give feedback.
3. On approval I commit with a message naming the phase. I ask before the first push / repo creation, then push after each approved phase.
4. Only then does the next phase start.
