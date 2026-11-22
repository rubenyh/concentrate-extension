# Decisions

Lightweight ADR log. Each entry gives the status, the context, the decision and the trade-off.

## ADR-001 — Two-layer blocking: routes (DNR + guard) and surfaces (CSS)

- **Status**: accepted (2026-11-21).
- **Context**: Hiding buttons alone does not stop shared links, search results or Back navigation. DNR sees only network requests, never `pushState`.
- **Decision**: DNR static rules handle full loads. A content-script guard handles SPA navigation and link clicks. CSS hides entry points.
- **Alternatives rejected**:
  - DNR only: misses SPA navigation.
  - JS only: the Short starts loading before the script reacts on a full load.
  - `webNavigation` plus a service worker: an extra permission and a background process.

## ADR-002 — Classifier is the source of truth; `rules.json` hand-mirrored

- **Status**: accepted.
- **Decision**: Write `static/rules.json` by hand. `tests/unit/rules.test.ts` asserts it agrees with `classify.ts` on a shared URL table.
- **Trade-off**: the same intent is written twice, but the parity test catches drift. A rules generator was rejected as more code than the duplication it removes.

## ADR-003 — CSS `:has()` instead of a MutationObserver

- **Status**: accepted.
- **Context**: The sites render content late (infinite scroll, SPA). The usual answer is a MutationObserver with throttled scans.
- **Decision**: Static stylesheets in `content_scripts.css`. The browser applies them to every later node with no JS, no lifecycle, no cleanup and no mutation loops.
- **Trade-off**: elements are hidden, not removed, so they stay in the DOM. Detection can only express what a selector can express. Add an observer only for a surface that needs JS logic, and document it here.

## ADR-004 — Navigation API for SPA route changes

- **Status**: accepted. The E2E tests verified that `currententrychange` fires in the content-script isolated world for page-initiated `pushState`.
- **Alternatives rejected**:
  - Patching `history.pushState`: needs a main-world injection.
  - Site events such as `yt-navigate-finish`: site-specific and undocumented.
  - URL polling: permanent CPU cost.
- **Consequence**: requires Chrome 102 or later. `minimum_chrome_version` is 120 (for `:has()` and stable APIs).

## ADR-005 — `blocked.html` web-accessible without `use_dynamic_url`

- **Status**: accepted (2026-11-21).
- **Context**: Chrome requires a DNR redirect target to be web accessible. `use_dynamic_url: true` would reduce fingerprinting.
- **Finding** (E2E, Chromium bundled with Playwright 1.65.1, 2026-11-21): with `use_dynamic_url: true`, DNR `extensionPath` redirects fail with `net::ERR_BLOCKED_BY_CLIENT`.
- **Decision**: Expose the static URL, only to the four matched hosts.
- **Trade-off**: YouTube and Instagram could detect the extension.

## ADR-006 — `location.assign` for clicks, `location.replace` for routes already in history

- **Status**: accepted. See ARCHITECTURE.md "Runtime flows". This prevents both lost history and Back loops.

## ADR-007 — esbuild + npm; no framework, no popup, no service worker

- **Status**: accepted.
- **Decision**: The MVP has no UI beyond the block page and no settings.
- **Alternatives rejected**:
  - Vite/CRXJS: adds a dev server and plugin layers for three tiny bundles.
  - pnpm: an extra install step for contributors, with no benefit at this size.

## ADR-008 — Instagram selectors hide links only, never ancestors

- **Status**: accepted.
- **Context**: Instagram class names are obfuscated and rotate.
- **Decision**: `a[href*="/reel/"]` and `a[href$="/reels/"]`, excluding `/explore/` hashtag links, hide only the anchor itself.
- **Trade-off**: an empty slot can remain in a grid, but no unrelated post can disappear.
- **Amended by ADR-010/011**: whole feed `article`s are hidden, but only on the home route and only behind user toggles.

## ADR-009 — HTTPS-only host patterns and `frame-ancestors 'none'`

- **Status**: accepted (2026-11-21), from the pre-release security review.
- **Decision**: Host permissions, content-script matches and web-accessible matches use `https://` only. Both sites upgrade `http://` with a server redirect, and the redirected HTTPS load then hits the DNR rules. The extension-pages CSP adds `frame-ancestors 'none'`, so the sites cannot frame `blocked.html` and drive its "Go back" button.
- **Trade-off**: none observed. The E2E suite passes unchanged.

## ADR-010 — Popup toggles in `chrome.storage.sync`, applied as `<html>` attributes

- **Status**: accepted (2026-11-21). The user asked for toggleable Instagram home-feed filters.
- **Decision**:
  - Add the `storage` permission (no install warning) and a toolbar popup with two checkboxes.
  - Content scripts mirror the settings and the home route as `data-rsb-*` attributes on `<html>`. CSS rules are scoped by those attributes.
  - Live check: Instagram keeps `<html>` attributes across in-app navigation.
- **Alternatives rejected**:
  - Messaging through a service worker: more moving parts for two booleans.
  - Injecting and removing stylesheets per toggle: more code than attribute scoping.
- **Trade-off**: `storage.sync` syncs the two values through the user's Chrome sync. They contain no browsing data (PRIVACY.md).

## ADR-011 — MutationObserver for suggested Instagram posts (exception to ADR-003)

- **Status**: accepted (2026-11-21).
- **Context**: The live inspection on 2026-11-21 (logged in, English UI, 30 posts) found one reliable signal for posts from unfollowed accounts: an in-post `[role=button]` with the text "Follow". It was on 14 of 14 suggested posts and on 0 of 16 followed posts. Feed `<article>`s have no other structural marker. CSS cannot match text.
- **Decision**: `src/content/suggested.ts` observes the document (childList, subtree, characterData). It coalesces mutations into one rescan per animation frame. The feed is virtualized, so there are only 5–9 articles to scan. It toggles `data-rsb-suggested`, which CSS hides. The observer runs only while the toggle is on. It ignores attribute mutations, so its own writes cannot loop. It uses `textContent`, because Instagram keeps rotated-out labels hidden in the DOM.
- **Trade-off**:
  - Language-dependent: the English "Follow" label only.
  - Ads need no JS: they lack `<time>` (17 of 17 ads, 0 of 30 posts).
