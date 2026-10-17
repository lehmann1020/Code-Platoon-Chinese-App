# The Build Prompt

Works for any kind of SPA: the app-specific parts live in `app_outline/`, not in the prompt.

Copy everything inside the box into Claude Code from the project root.
It is one option, not the only approach — but each sentence earns its place (see notes below).

```text
I would like you to build a Front-End Single Page Application from the wire frames and user
stories I have mapped out.

The tech-stack for this application will be as follows:
- React.js + Vite
- React Router DOM with Browser Router

Skills necessary for this application are as follows:
- Front-End Design
- UI UX Pro Max
- Taste
- Design Motion Principles

There will be no API interactions and all data should be retained only at the browser level,
meaning if I refresh/rerender my site all of the data should reset.

I have created a series of documents and images as a reference for what I would like this
application to look like and isolated everything by pages. Take a look at this folder
@./app_outline and read the `user_journey.md` file to get context for the users journey through
the application. Then look at the `app.png` to visualize the entire application. Finally under
pages, you'll find a wire-frame corresponding to each page along with a detailed user story for
how a user would interact with this page. Additionally, when it comes to design style, you can
read the `style_guide.md` and apply its guidelines as you see fit.

Use the Context7 MCP to gather all relevant documentation for our tech stack.

Ensure to utilize the `playwright` & `Chrome Dev Tools` MCP servers to supervise the development
of this Application. After each page is built, use Playwright to screenshot it and compare
against the wireframe before moving on and ensuring it's output matches the desired outcome from
the wire-frames and user stories.

Finally the execution of this app should happen in phases, phases should correspond roughly to
pages or major feature areas. I'll leave it to you to declare the number of phases and what
their independent passing conditions are, but these conditions should be approved by me and
allow me to provide you feedback before moving on into the next phase.

Before writing any code, please confirm your understanding of the application by summarizing
the user journey and listing the pages you plan to build.
```

## Useful additions (we added these during MyFlix and they helped)
```text
- If any file I referenced is missing or named differently, tell me what to create/rename
  before you start.
- Desktop only for now; do not build or test mobile layouts.
- Commit after every approved phase with a message naming the phase.
- Put placeholder data in src/data and invent it where I haven't supplied any.
```

## Why each part is there
| Sentence | Purpose |
|---|---|
| Stack + skills | Constrains choices so the result is consistent and styled, not generic. |
| "No API… resets on refresh" | Sets scope: state in React, no localStorage/backend work. |
| `@./app_outline` + reading order | Gives context in the right order: journey → whole app → per-page. Limits context per page. |
| Context7 | Current docs, avoids deprecated patterns. |
| Playwright + DevTools after each page | Closes the loop: the agent verifies against the wireframe instead of assuming. |
| Phases with passing conditions you approve | Keeps you in control; feedback happens between phases, not at the end. |
| "Confirm understanding before code" | Surfaces misunderstandings while they are free to fix. |
