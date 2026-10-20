# Page: Log in (`/login`)

## Wireframe
```
+--------------------------------------------------+
|                       [汉]                        |
|                   Hanzi Match                    |
|          Log in to pick up where you left off.   |
|        +------------------------------+          |
|        | Email    [__________________]|          |
|        | Password [__________________]|          |
|        |        [       Log in       ]|          |
|        +------------------------------+          |
|        New to Hanzi Match? Create an account     |
+--------------------------------------------------+
```

## User story
As a returning learner, I log in to see and continue only my own progress.

## Acceptance criteria
- [ ] Email and password are required
- [ ] A wrong email or password shows "That email and password don’t match an account."
- [ ] After logging in, the learner returns to the page that sent them here (e.g. `/play`), otherwise Welcome
- [ ] Only for logged-out visitors; a logged-in user is sent to `/`
- [ ] Enter submits; the email field is focused on load
