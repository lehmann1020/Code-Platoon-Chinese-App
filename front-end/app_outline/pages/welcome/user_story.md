# Page: Welcome (`/`)

## Wireframe
```
+--------------------------------------------------+
|                       [汉]                        |
|                 Welcome, {name}                  |
|   Learn HSK 1 vocabulary by matching characters  |
|   to their pinyin. Hanzi Match saves your        |
|   progress as you go.                            |
|                                                  |
|              [   Start matching   ]              |
|                                                  |
|               Not you? Log out                   |
+--------------------------------------------------+
```
(The original wireframe.png shows the pre-auth name + email form; name and email now come from Register.)

## User story
As a logged-in learner, I see who I'm logged in as and start (or resume) practising, or log out if this isn't me.

## Acceptance criteria
- [ ] Only for logged-in users; a logged-out visitor is sent to `/login`
- [ ] The heading shows the learner's name (from their `users` row)
- [ ] "Start matching" (focused on load) loads the words and the learner's saved progress, then goes to `/play`; on failure it shows "Could not connect. Please try again."
- [ ] "Log out" ends the session and goes to `/login` (this page has no header, so it has its own Log out)
