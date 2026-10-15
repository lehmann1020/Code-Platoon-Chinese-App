# Hanzi Match

A single-page app for practising **HSK 1** vocabulary: match 6 hanzi to their pinyin at a time, with explosion/shake feedback, definition toasts and a progress tracker.

Stack: React + Vite, React Router DOM (BrowserRouter). No API; all state in memory (refresh resets).

```bash
npm install
npm run dev     # http://localhost:5173
npm run lint
npm run build
```

Specs live in `app_outline/` (user journey, style guide, per-page user stories). Build phases and their passing conditions are in `docs/phases.md`.
