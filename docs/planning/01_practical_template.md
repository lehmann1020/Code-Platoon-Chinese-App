# Practical Template — answer before writing any code

Roughly 80% of the UI can be sketched from these answers. Vague prompts produce generic apps;
this document is the "context package" your agent builds from.

## 1. Identify your application
- **What is your app?** (1–2 sentences)
  > _e.g. "A recipe box where I can add, search and edit my recipes."  /  "A habit tracker with a weekly view."_
- **What problem does it solve?** (pain point, how people cope today, what frustrates them)
  > _
- **Who are the users?** (user types, responsibilities, the information each needs)
  > _How many user types? If "just me", write that. One user type keeps the app simple._

## 2. The eight questions
| # | Question | Your answer |
|---|----------|-------------|
| 1 | What problem does the application solve? | |
| 2 | Who are the users? | |
| 3 | What are their primary goals? (top 3 reasons to open the app) | |
| 4 | What information do they need to see? | |
| 5 | What actions can they perform? (create / read / update / delete / search / filter / sort / export / share) | |
| 6 | What pages are required? | |
| 7 | What data must be collected? | |
| 8 | What permissions exist? (who can see / change what) | |

## 3. Decisions to make now (cheap now, expensive mid-build)
- [ ] Data lives only in the browser and resets on refresh? (default for a front-end-only SPA) Y / N
- [ ] Is there a first-visit/onboarding step? What does it collect? (optional pattern: `08_optional_patterns/onboarding-guard`)
- [ ] Desktop only, or responsive? (decide up front; MyFlix chose desktop only)
- [ ] App name: ______  (use ONE name everywhere — folder, package, wireframes)
- [ ] Placeholder content: invent it, or supply your own? Images?
- [ ] Any feature that you describe in prose but did not wireframe? Wireframe it now.

## 4. Sanity check: do the pieces agree?
Your written notes and your wireframes must tell the same story. In one real build the written plan
described a filterable list while the wireframe showed onboarding + carousels, and the page
list differed. Reconcile these BEFORE the build, or the agent has to guess.
