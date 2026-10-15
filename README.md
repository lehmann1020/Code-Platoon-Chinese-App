# Hanzi Match

A single-page app for practising **HSK 1** Chinese vocabulary. Match each hanzi to its pinyin, six words at a time, until you've matched all 149 words.

**Stack:** React 19 + Vite, React Router DOM (BrowserRouter), plain CSS. No API; all state lives in memory, so a refresh resets everything. Desktop only.

## Run it
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
