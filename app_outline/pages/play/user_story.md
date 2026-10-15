# Page: Play (`/play`)

## Wireframe
```
+----------------------------------------------------------+
| Hi, <name>               Hanzi Match                     |
|                                                          |
|        [ toast: 你好 · nǐ hǎo — hello ]                  |
|                                                          |
|     HANZI                         PINYIN                 |
|   +----------+                +-------------+            |
|   |   你好    |                |   xièxie    |            |
|   +----------+                +-------------+            |
|   +----------+                +-------------+            |
|   |   谢谢    |                |   nǐ hǎo    |            |
|   +----------+                +-------------+            |
|   ... (6 cards per column, shuffled independently) ...   |
+----------------------------------------------------------+
| Matched 12 / 150  [=====-----------------------------]   |
+----------------------------------------------------------+
```

## User story
As a learner, I match each Chinese character to its pinyin, six words at a time, with fun feedback and a visible progress count, until I have matched all HSK 1 words.

## Acceptance criteria
- [ ] Left column: 6 hanzi cards. Right column: 6 pinyin cards. Each column shuffled independently; the two columns do not line up
- [ ] Clicking a card selects it (ring). Clicking another card in the same column moves the selection. Clicking a card in the opposite column evaluates the pair. Order (hanzi first or pinyin first) does not matter. Clicking the selected card again deselects it
- [ ] **Correct:** both cards explode and are removed; a toast shows hanzi, pinyin and the English definition; the tracker increases by 1
- [ ] **Wrong:** both cards turn red and shake ~450ms, then return to normal unselected; the tracker does not change; input is blocked briefly during the shake
- [ ] When the 6th pair of a set is matched, a "Congratulations!" toast with a **Continue** button appears (stays until clicked; Continue is focused)
- [ ] Clicking Continue loads the next set of up to 6 unmatched words (staggered entrance)
- [ ] The final set may have fewer than 6 cards; after it is matched the toast says "Congratulations! You've learned all N HSK 1 words!" and offers **Play again** (resets progress and reshuffles)
- [ ] No two words in a set share the same pinyin
- [ ] Tracker pinned at the bottom shows `matched / total` where total = number of words in the HSK 1 data file; the bar fills proportionally; `aria` progressbar semantics
- [ ] Header shows the learner's name
- [ ] Keyboard: Tab to cards, Enter/Space to select; toasts are announced via `aria-live`
- [ ] `prefers-reduced-motion`: no shake/explosion movement, just a color flash
- [ ] Refresh returns to the welcome screen (state is in memory only)

## Edge cases
- Rapid clicks during an animation are ignored
- Selecting two cards in the same column never triggers a match
- Multiple definition toasts stack (max 3 visible) and auto-dismiss
