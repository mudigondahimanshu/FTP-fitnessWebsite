# FTP · Feel The Pump — Design System (Source of Truth)

Every rebuilt page MUST follow this spec exactly. The shared assets already exist — use them, do not duplicate them.

## Page skeleton (mandatory)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PAGE TITLE · FTP Feel The Pump</title>
  <meta name="description" content="..." />
  <link rel="icon" type="image/webp" href="/assets/img/logo-small.webp" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="/assets/css/theme.css" />
  <style>/* page-specific CSS only */</style>
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <main id="main">
    <!-- page content; navbar + footer are injected automatically by app.js -->
  </main>
  <script src="/assets/js/dsa.js" defer></script>
  <script src="/assets/js/auth.js" defer></script>
  <script src="/assets/js/app.js" defer></script>
  <!-- page-specific script last, defer -->
</body>
</html>
```

Rules:
- **NO Bootstrap, NO jQuery, NO boxicons.** Only theme.css + inline page CSS. Icons: inline SVG (24×24 viewBox, stroke currentColor) only where needed — never emoji.
- **All asset/page URLs are absolute from root** (e.g. `/assets/img/chest_image.webp`, `/workout_page/chest/chest.html`). Never relative `../`.
- **Do NOT write your own navbar or footer** — app.js injects them.
- Images: use only `/assets/img/*.webp` (already generated), always with `loading="lazy"` (except above-the-fold), `width`/`height` attributes, descriptive `alt`.
- All scripts `defer`.

## Design tokens (from theme.css — use the classes, don't restyle)

- Background `#060a09`, cards `.card`, accent neon green `var(--accent)` #22f55e.
- Headings auto-use Barlow Condensed uppercase. Body is Barlow.
- Available components: `.container`, `.section`, `.page-hero` + `.eyebrow` + `.page-title` (+`<span class="glow">` for accent words) + `.lead`, `.card`, `.card-grid`, `.card-media`, `.tag`, `.btn .btn-primary / .btn-ghost`, `.field` (label+input+`.error-msg`), `.table-wrap > table.data`, `.stat-row > .stat`, `.breadcrumb`, `.reveal` (+ `.reveal-delay-1/2/3`) for scroll animations, `window.FTPApp.toast(msg, 'ok'|'error')`.

## Page pattern

1. `.page-hero` with `.eyebrow` (section label), `.page-title` (one glowing word), `.lead` paragraph.
2. Content sections in `.section > .container`, cards in `.card-grid`, add `.reveal` to animate.
3. Sub-pages get a `.breadcrumb` (Home / Section / Page) at the top of the hero container.
4. Preserve ALL real content (exercise names, YouTube links, diet text, PDF links) from the old page — restyle, don't lose data. Fix typos and grammar while migrating.

## DSA library (window.FTPDSA)

- `Trie` — `insert(phrase, payload)`, `search(prefix, limit)` — for filtering/search features.
- `MinHeap` — `push/pop/peek/toSortedArray`, `MinHeap.from(items, cmp)` — priority ordering.
- `LRUCache(capacity, storageKey)` — recently-viewed.
- `UndoStack(limit)` — undo history.

Use them where they genuinely fit; mention in a small UI hint when a feature is powered by one (e.g. "sorted by priority queue").

## Auth (window.FTPAuth)

`register({username,email,password})`, `login({username,password})` (both async, throw Error with user-friendly message), `currentUser()`, `logout()`. Session shown in navbar automatically.

## Quality bar

- Contrast ≥ 4.5:1, focus states, keyboard navigable, 44px touch targets, `cursor: pointer` on clickables.
- Responsive at 375 / 768 / 1024 / 1440 — no horizontal scroll.
- Transitions 150–300ms; respect `prefers-reduced-motion` (theme.css handles globally).
- No console errors.
