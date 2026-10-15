# Phase Plan (approve this before any phase starts)

Phases follow pages / major features. Each has an INDEPENDENT passing condition you can verify.

## A generic plan (works for most SPAs) — edit to fit yours
| # | Phase | Deliverable | Passing conditions |
|---|---|---|---|
| 0 | Scaffold | Vite project, router, state provider, design tokens, layout/nav, 404 | Build + lint clean; every route renders; unknown URL shows 404; refresh resets state |
| 1 | Primary list/home page | The page users land on, from its wireframe | Screenshot matches wireframe; empty state works; links navigate |
| 2 | Create / edit flow | Form with validation | Each validation error appears and clears; success path updates state and navigates; Cancel works |
| 3 | Detail page | One record + actions (edit, delete) | Reads `:id`; missing id shows not-found; delete needs confirmation and updates the list |
| 4 | Search / filter / sort | Controls on the list | Each control narrows the list correctly; combined controls work; "no matches" state |
| 5 | Remaining pages | One phase per extra page/feature from your wireframes | Per its user story's acceptance criteria |
| 6 | Polish + audit | Motion pass, reduced motion, accessibility, Lighthouse, full-journey test | 0 console errors; Lighthouse a11y/best-practices >= 95; whole journey works with keyboard only |

## Worked example: MyFlix (a streaming-style library)
| # | Phase | Passing conditions |
|---|---|---|
| 0 | Scaffold | build/lint clean; routes render; guarded routes redirect to onboarding |
| 1 | Onboarding | exactly 3 of 7 genres; extra pick blocked; Continue disabled until 3 |
| 2 | Catalog + card | hover, favourite toggle, progress field work |
| 3 | Home carousels | arrows scroll and disable at ends; recommendations filtered by picks; empty state |
| 4 | Detail modal | open/close via button, backdrop, Escape; focus returned; edits sync everywhere |
| 5 | Watching + Favourites pages | show only matching items; update instantly |
| 6 | Polish + audit | 0 console errors; Lighthouse 100/100; full journey |

## Template row
| # | Phase name | Deliverable | Passing conditions (observable, testable) |
|---|---|---|---|

## Rules of the game
1. Agent proposes phases + conditions → you edit/approve.
2. Agent builds ONE phase, verifies with Playwright/DevTools, reports results honestly (including what it did NOT check).
3. You review and either give feedback or say "approved".
4. Commit. Only then the next phase.
