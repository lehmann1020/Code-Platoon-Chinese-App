# Per-Phase Verification Checklist (Playwright + Chrome DevTools)

**Playwright**
- [ ] Open the page at the target viewport (e.g. 1280x800); take a screenshot; compare to the wireframe.
- [ ] Click through every interaction in the user story; assert the visible result (not just "no error").
- [ ] Test each empty state, each blocked/disabled state, and each close path (button, backdrop, Escape).
- [ ] Navigate with the app's own links (state survives) AND by URL (state resets — expected).
- [ ] Check keyboard: Tab order, focus ring visible, focus returns after closing overlays.
- [ ] Restore the viewport size when done.

**Chrome DevTools**
- [ ] Console: 0 errors / warnings after the flows above.
- [ ] Lighthouse (desktop): Accessibility and Best Practices >= 95; fix SEO basics (meta description).
- [ ] Network: no unexpected requests (a no-API app should only request its own assets).

**Test-script gotchas**
- A locator that matches two elements (same item in two rows) throws a "strict mode" error — scope it to a section or use `.first()`.
- After clicking a router link, wait for the URL/element before reading the page, or you read the OLD page.
- Lazy-loaded images are not "complete" until scrolled into view — don't count them as failures.
- Data you created in one step persists in the next (until a full reload) — reload for a clean slate.
