# Page: Welcome (`/`)

## Wireframe
```
+--------------------------------------------------+
|                    Hanzi Match                   |
|          Learn HSK 1 vocabulary by matching      |
|                                                  |
|        +------------------------------+          |
|        | Name   [____________________]|          |
|        | Email  [____________________]|          |
|        |        (error text if any)   |          |
|        |        [   Start matching  ] |          |
|        +------------------------------+          |
+--------------------------------------------------+
```

## User story
As a learner, I enter my name and email so the app can greet me and I can start practising HSK 1 vocabulary.

## Acceptance criteria
- [ ] Name and email are both required; name must not be blank (trimmed), email must be a valid address
- [ ] Errors appear after a failed submit or when a field loses focus; each field has `aria-invalid` and an error message
- [ ] "Start matching" is disabled until both fields are valid
- [ ] On submit the name and email are stored in memory only and the app goes to `/play`
- [ ] Visiting `/play` directly (e.g. after a refresh) redirects here
- [ ] Enter submits the form; the first field is focused on load
