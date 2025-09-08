Archived items (kept for reference, not in active build)

- archive/styles/Home.module.css — previously at `styles/Home.module.css`; unused in current pages.
- assets/background.jpg — currently unused; left in place under `assets/` to avoid binary moves in this environment. You can move it to `archive/assets/` later if desired.

Notes
- Pages now use the getLayout pattern; header/footer come from `components/layout.tsx` via `pages/_app.tsx` getLayout fallback or each page's `getLayout`.
