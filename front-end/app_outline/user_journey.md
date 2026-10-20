# Hanzi Match — User Journey

**User:** a learner with their own account (Supabase Auth, email + password) practising HSK 1 vocabulary.
**Data:** saved in Supabase per user — matched words and play sessions. Each learner sees only their own progress (RLS).
**Vocabulary:** the HSK 1 word list (hanzi, pinyin with tone marks, English definition), stored in the `words` table.

## Flow
1. **Register (`/register`)** — a new learner enters **name**, **email** and a **password** (at least 6 characters). The account is created and they are logged in.
   **Log in (`/login`)** — a returning learner enters email + password. A logged-out visitor who opens any other page is sent here, and returns to that page after logging in.
2. **Welcome (`/`)** — "Welcome, {name}" with **Start matching** (loads the learner's saved progress) and a **Log out** link.
3. **Start playing (`/play`)** — the game shows **6 words at a time** in two columns: **hanzi on the left, pinyin on the right**, each column shuffled independently.
4. **Matching** — the learner clicks one card in either column, then one card in the other column. The order does not matter (hanzi first or pinyin first).
   - **Correct match:** both cards **explode** (particle burst) and disappear; a **toast shows the definition** of the matched word (hanzi, pinyin, English).
   - **Wrong match:** both cards **turn red and shake** briefly, then return to normal, unselected.
5. **Set complete** — when all 6 pairs are matched, a **"Congratulations!" toast with a Continue button** appears.
6. **Next set** — clicking **Continue** brings in the next 6 words. This repeats until every HSK 1 word has been matched. If the word count isn't a multiple of 6, the final set has fewer cards.
7. **All words matched** — the last toast says "Congratulations! You've learned all N HSK 1 words!" (with a "Play again" button that reshuffles and resets progress).
8. **Tracker** — pinned at the bottom of the screen throughout: **matched / total** (e.g. `12 / 150`) across all sets, with a progress bar. Total = number of words in the HSK 1 file.
9. **Mistakes** — wrong matches cost nothing except the shake; the tracker only counts correct matches.
10. **Header** — "Hi, {name}", the app name, the level, and a **Log out** button. Log out ends the session, removes the saved tokens from the browser, and goes to Log in.
11. **Refresh** — the learner stays logged in (the saved session is checked with Supabase) and lands back on the same page with their progress. An invalid or expired session goes to Log in.

## Routes
| Route | Page | Notes |
|---|---|---|
| `/login` | Log in | logged-out only (a logged-in user goes to `/`) |
| `/register` | Register | logged-out only |
| `/` | Welcome | logged in; Start matching + Log out link |
| `/play` | Play | logged in; loads the learner's progress if needed (e.g. after a refresh) |
| `*` | redirect to `/` | (then to `/login` if logged out) |

## Rules of the game
- A set is built from the next unmatched words (words are shuffled once per session, so each play-through differs).
- No two words in the same set share the same pinyin (so a pinyin card never matches two hanzi).
- A pair is "correct" only if the hanzi card and the pinyin card belong to the same word.
