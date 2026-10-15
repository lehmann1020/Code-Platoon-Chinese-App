# Hanzi Match — Style Guide

**Mood:** calm, focused, a little bookish — rice paper and ink, with one confident accent. Playful only in the feedback (explosion, shake).

## Color (CSS variables)
- Background (paper) `#F6F1E7`; surface (card) `#FFFDF8`; raised/hover `#EFE8DA`
- Text (ink) `#1D1B19`; muted `#6F695F`; border `#DDD4C3`
- Accent (vermilion seal) `#C8452D` for primary buttons, selection ring, tracker fill
- Correct (jade) `#2F7D5B` for the explosion particles and success toast accent
- Wrong (red) `#D8372B` background tint with `#FFE9E6` card fill during the shake
- Contrast: body text >= 4.5:1; selected/wrong/correct are never shown by color alone (selected has a thick ring, wrong shakes, correct bursts)
- Dark mode: out of scope for now

## Type
- Hanzi: **Noto Serif SC** (Google Fonts), 40–48px on cards
- UI text: **Inter** 16px / 1.5; headings **Space Grotesk**
- Pinyin cards: Inter 22px, tone marks must render correctly (test: ā á ǎ à ē é ě è ī í ǐ ì ō ó ǒ ò ū ú ǔ ù ǖ ǘ ǚ ǜ)

## Layout (desktop only, min width 1024px)
- Page max width 960px, centered; header with the learner's name on the left, "Hanzi Match" wordmark centered
- Board: two columns with a 48px gap; each column has 6 cards stacked with 12px gaps; cards ~ 88px tall, full column width
- Tracker: fixed to the bottom, full width, 64px tall, `Matched 12 / 150` + progress bar
- Toasts: appear top-center, below the header; stack up to 3; definition toasts auto-dismiss after ~3.5s; congratulations toast stays until Continue

## Motion
- Card hover: lift 2px + border color change, 150ms ease-out
- Select: accent ring + slight scale 1.02, 150ms
- **Explode (correct):** 14–18 particles per card burst outward with fade, ~600ms, then the card slot is empty; jade/vermilion/gold mix
- **Shake (wrong):** cards fill red and shake horizontally +-6px, 3 cycles, ~450ms, then reset
- Toast in: slide down + fade 220ms; out: 160ms
- New set: cards fade/slide in with a 40ms stagger
- Honour `prefers-reduced-motion`: replace explosion/shake with a quick color flash, no movement

## Components
- Match card (button): hanzi or pinyin text centered; states: default, hover, focus-visible, selected, wrong, matched/exploding, disabled
- Toast: definition toast (hanzi + pinyin + English), congratulations toast (heading + Continue button)
- Primary button: vermilion fill, white text, 44px tall, radius 10px
- Inputs: 44px tall, 1px border, visible focus ring, inline error text
- Focus ring: 2px vermilion outline, always visible

## Accessibility
- Cards are real `<button>`s with `aria-pressed` for selected state and an accessible name ("Hanzi: 你好" / "Pinyin: nǐ hǎo")
- Toasts live in an `aria-live="polite"` region; the Continue button receives focus when the congratulations toast appears
- Whole game playable with keyboard: Tab to a card, Enter/Space to select
