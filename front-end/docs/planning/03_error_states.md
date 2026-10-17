# What Happens When Something Goes Wrong?

Commonly skipped and vital to application integrity. For every page, fill in the table.
A front-end-only SPA still has empty states and validation errors.

| Situation | Where | What the user sees | What the user can do |
|---|---|---|---|
| Empty list / nothing saved yet | every list page | friendly message | link/button to the next step |
| Form validation fails | forms | inline message next to the field | fix and retry |
| Too many / too few selections | any multi-select | hint text, disabled submit | deselect / select |
| Unknown URL | router | redirect to home (or a 404 page) | navigate home |
| Record id in the URL doesn't exist | detail/edit pages | not-found message | link back to the list |
| Direct visit to a page that needs a prior step | router guard (if any) | redirect to that step | complete it |
| Destructive action (delete) | detail/list | confirmation dialog | confirm or cancel |
| Image fails to load | anywhere with images | fallback | none needed |
| (if API later) request fails / offline | | | |
| (if auth later) login fails | | | |
| (if payments later) payment fails | | | |
| Refresh wipes browser-only data | whole app | back to first-visit state | start again (expected!) |
