# Hanzi Match — User Journey

**User:** one learner practising HSK 1 vocabulary. **Data:** in memory only; a refresh resets everything (name, email, progress).
**Vocabulary:** the HSK 1 word list (hanzi, pinyin with tone marks, English definition) shipped as a local file in the app.

## Flow
1. **First visit (`/`)** — a welcome screen asks for **name** and **email**. Both are required; the email must look valid. Continue stays disabled until both are valid.
2. **Start playing (`/play`)** — the game shows **6 words at a time** in two columns: **hanzi on the left, pinyin on the right**, each column shuffled independently.
3. **Matching** — the learner clicks one card in either column, then one card in the other column. The order does not matter (hanzi first or pinyin first).
   - **Correct match:** both cards **explode** (particle burst) and disappear; a **toast shows the definition** of the matched word (hanzi, pinyin, English).
   - **Wrong match:** both cards **turn red and shake** briefly, then return to normal, unselected.
4. **Set complete** — when all 6 pairs are matched, a **"Congratulations!" toast with a Continue button** appears.
5. **Next set** — clicking **Continue** brings in the next 6 words. This repeats until every HSK 1 word has been matched. If the word count isn't a multiple of 6, the final set has fewer cards.
6. **All words matched** — the last toast says "Congratulations! You've learned all N HSK 1 words!" (with a "Play again" button that reshuffles and resets progress).
7. **Tracker** — pinned at the bottom of the screen throughout: **matched / total** (e.g. `12 / 150`) across all sets, with a progress bar. Total = number of words in the HSK 1 file.
8. **Mistakes** — wrong matches cost nothing except the shake; the tracker only counts correct matches.
9. **Refresh** — clears everything; the learner returns to the welcome screen.

## Routes
| Route | Page | Notes |
|---|---|---|
| `/` | Welcome | name + email form |
| `/play` | Play | guarded: redirects to `/` if no name/email yet |
| `*` | redirect to `/` | |

## Rules of the game
- A set is built from the next unmatched words (words are shuffled once per session, so each play-through differs).
- No two words in the same set share the same pinyin (so a pinyin card never matches two hanzi).
- A pair is "correct" only if the hanzi card and the pinyin card belong to the same word.
