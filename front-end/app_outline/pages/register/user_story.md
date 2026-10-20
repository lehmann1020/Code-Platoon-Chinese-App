# Page: Register (`/register`)

## Wireframe
```
+--------------------------------------------------+
|                       [汉]                        |
|               Create your account                |
|        Your Hanzi Match progress, saved to you.  |
|        +------------------------------+          |
|        | Name     [__________________]|          |
|        | Email    [__________________]|          |
|        | Password [__________________]|          |
|        |          At least 6 characters.          |
|        |        [   Create account   ]|          |
|        +------------------------------+          |
|        Already have an account? Log in           |
+--------------------------------------------------+
```

## User story
As a new learner, I create an account so my progress is saved to me and nobody else sees it.

## Acceptance criteria
- [ ] Name (not blank), email (valid) and password (at least 6 characters) are required; errors show after a failed submit or when a field loses focus, with `aria-invalid`
- [ ] On success the learner is logged in and goes to Welcome, which greets them by the name they typed (copied into `users` by the database trigger)
- [ ] An email that already has an account shows "An account with that email already exists. Try logging in."
- [ ] Only for logged-out visitors; a logged-in user is sent to `/`
- [ ] Enter submits; the first field is focused on load
