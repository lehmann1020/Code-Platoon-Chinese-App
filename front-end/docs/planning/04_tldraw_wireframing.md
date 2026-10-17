# Wireframing with TLDraw (tldraw.com)

1. Make one **frame per screen**, matching the user journey order. Example screens: Home,
   Dashboard, Profile, Settings, Search Results, Details Page, Reports, Admin Panel.
2. Inside each frame: information shown, available actions, buttons, forms, navigation.
3. Add the **error/empty states** from `03_error_states.md` as extra frames.
4. Label everything with the SAME words you will use in the app (nav labels, headings).
5. Export:
   - the whole canvas as `app.png`
   - each frame as its own PNG, saved into that page's folder in `app_outline/pages/<page>/`

Tips
- Boxes + labels are enough. Wireframes show structure, not styling (that is `style_guide.md`).
- Draw the wireframe at the desktop size you intend to build (decide mobile vs desktop first).
- Arrows for carousels, modals as overlay frames, and show a selected/disabled state when it matters.
- A wireframe is a promise: the agent will screenshot the built page and compare it to this.
