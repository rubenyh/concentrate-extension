# Testing

## Strategy

| Layer            | Tool                                            | What it proves                                                                                                                                                   |
| ---------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit: routes     | Vitest (`tests/unit/classify.test.ts`)          | The classifier gets blocked and allowed URLs right, including query, slash, case, host and look-alike prefixes                                                   |
| Unit: DNR parity | Vitest (`tests/unit/rules.test.ts`)             | `static/rules.json` regexes agree with the classifier on the same table (`tests/unit/urls.ts`)                                                                   |
| Unit: tagger     | Vitest + jsdom (`tests/unit/suggested.test.ts`) | The suggested-post tagger stops cleanly (no queued scan runs after stop) on toggle-off and route change, restarts, and survives rapid toggling with one observer |
| Unit: selectors  | Vitest + jsdom (`tests/unit/selectors.test.ts`) | Every CSS selector hides a Shorts/Reels fixture element, none touches a regular one, and each selector has a positive fixture                                    |
| E2E              | Playwright (`tests/e2e/extension.spec.ts`)      | The built `dist/` in real Chromium: DNR redirects, SPA guard, click interception, Back/Forward, the block page, and computed visibility on fixtures              |
| Live             | Manual checklist below                          | Behavior on the real sites, which change without notice                                                                                                          |

Automated tests never contact the live sites. E2E serves `tests/fixtures/*.html` on `https://www.youtube.com/**` and `https://www.instagram.com/**` through `context.route`. DNR runs before the route handler, so blocked URLs never reach the fixture (verified).

## Commands

```sh
npm test               # unit + selector tests
npm run check          # typecheck + lint + format check + unit
npx playwright install chromium   # once
npm run test:e2e       # builds dist/, then Playwright (headless, bundled Chromium)
```

A non-zero exit is a failure.

## E2E scenarios covered

- YouTube:
  - Direct load of `/shorts/id`, `?feature=share`, `/@creator/shorts`.
  - A regular watch page loads, and fixture surfaces are hidden or visible as expected.
  - pushState to a Short is blocked. Back returns to the prior page, and Forward is blocked again.
  - A click on a Shorts link is intercepted before the site router, and "Go back" returns.
  - A regular link click is left to the site router.
- Instagram:
  - Direct load of `/reel/id/`, `/reels/`, `/user/reels/`.
  - Posts, profile, stories and DMs load.
  - A click on a reel link is blocked.
  - pushState to the Reels tab is blocked, and Back works.
- A blocked page in a fresh tab offers the site home link.

## Live checks

Run with the built extension. Use Playwright's bundled Chromium, or Chrome with "Load unpacked". Record the date and result.

### YouTube

| #   | Step                                              | Expected                                   | Result                                                                            |
| --- | ------------------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------- |
| Y1  | Open `https://www.youtube.com/shorts/dQw4w9WgXcQ` | Block page                                 | **Pass** 2026-11-21 (logged out, Playwright Chromium)                             |
| Y2  | Search "funny cats", scroll                       | No Shorts visible, regular results visible | **Pass** 2026-11-21: 50 Shorts lockups present, 0 visible, 30 watch links visible |
| Y3  | Sidebar / mini-guide                              | No Shorts entry                            | **Pass** 2026-11-21 (English UI)                                                  |
| Y4  | Open a channel (`/@MrBeast`)                      | No Shorts tab                              | **Pass** 2026-11-21                                                               |
| Y5  | Watch `/watch?v=dQw4w9WgXcQ`                      | Player present, related videos visible     | **Pass** 2026-11-21                                                               |
| Y6  | Home page, logged in, scroll                      | No Shorts shelf or Shorts items            | **Unverified**: the logged-out home has no feed                                   |
| Y7  | Subscriptions feed, logged in                     | No Shorts                                  | **Unverified**: needs an account                                                  |
| Y8  | Click a Short from home (logged in), then Back    | Block page, then Back returns home         | **Unverified** live (covered by E2E)                                              |
| Y9  | Playlists, comments, subscribe button             | Work normally                              | **Unverified** live                                                               |

### Instagram (needs a logged-in account)

| #   | Step                                                            | Expected                                           | Result                                                                                                                                           |
| --- | --------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| I1  | Open `https://www.instagram.com/reels/`                         | Block page                                         | Unverified live (extension not installed in the live browser). Covered by E2E.                                                                   |
| I2  | Sidebar                                                         | No Reels link                                      | **Pass** 2026-11-21*                                                                                                                             |
| I3  | Open a profile with reels                                       | No Reels tab, no reel tiles in the grid            | **Pass** 2026-11-21*: tab hidden, 10/10 `/reel/` tiles hidden, 14/14 `/p/` tiles visible                                                         |
| I4  | Click a reel from Explore or search, if any is visible          | Block page                                         | **Pass** 2026-11-21*: 44/44 Explore reel tiles hidden, 0/12 other tiles hidden, so none clickable                                                |
| I5  | Open a regular post, view stories, send a DM                    | Work normally                                      | Partial 2026-11-21*: post dialog visible, profile tabs and buttons visible. Stories and DMs not checked.                                         |
| I6  | Scroll the home feed, both toggles on                           | Only followed non-reel posts visible               | **Pass** 2026-11-21*: 48 posts, 0 mismatches (2 followed posts visible; 18 followed reels, 13 suggested reels, 5 suggested posts, 10 ads hidden) |
| I7  | Toggle "Hide reels" off, then "Only show accounts I follow" off | Followed reels reappear; then everything reappears | **Pass** 2026-11-21* (attribute toggles)                                                                                                         |

\* Live check by a separate Claude session with Claude in Chrome in the user's logged-in Chrome (English UI). The extension's built CSS and tagging logic were injected into the page, because the unpacked extension was not installed there. Route blocking (DNR, guard) was therefore not exercised live on Instagram. Only 2 followed non-reel posts were in the sample, so the evidence against false positives is thin. The profile grid had no "Clip" tiles, so that selector is unverified live.

### Shared

- Reload a blocked URL: the block page is shown again with no loop.
- Two tabs: blocking works independently in each.
- After installing or reloading the extension: new page loads are blocked at once, and already-open tabs need a reload for hiding and the SPA guard.

## Regression checklist (before each release)

1. `npm run check` and `npm run test:e2e` are green.
2. Re-run live Y1–Y5, and the Instagram checks if an account is available. Update the table dates.
3. If a surface reappeared, follow the `platform-blocking` skill.

## Verification log

- 2026-11-21:
  - `npm run check`: 122 unit tests passed.
  - `npm run test:e2e`: 14 passed.
  - Live YouTube Y1–Y5 passed (logged out).
  - Instagram live (CSS and tagger injected, logged in): I2–I4, I6 and I7 pass; I5 partial (see table). 20 tagger scans over 48 articles took 20.4 ms. No console errors.
  - After the feed filters were added: `npm run check` (129 unit tests) and `npm run test:e2e` (17) pass. After the security-review fixes (tagger runs on home only): 18 E2E pass.
  - Security review (general-purpose agent following `.claude/agents/security-reviewer.md`): no blockers, `npm audit` reports 0 vulnerabilities.
  - After ADR-009 (https-only hosts and CSP): `npm run check` and `npm run test:e2e` (14) still pass.

- 2026-11-23 (security remediation; Node 24.13.0 locally, below the new engines range, so npm warns `EBADENGINE`; CI uses Node 22):
  - `npm ci`, `npm run check` (137 unit tests, 8 new in `tests/unit/suggested.test.ts`), `npm run build`, `npm run package`, `npm audit` (0 vulnerabilities) and `npm audit signatures` pass.
  - `npm run test:e2e`: 18 passed. An earlier run on a heavily loaded machine had 1 failure in the Instagram home-feed test: once no content-script CSS was applied at all, and once the suggested post stayed untagged past the 5 s poll. Repeating the 10 Instagram tests 3 times with one worker then passed 30/30, and the final full run passed. Treated as load flakiness; watch for it in CI.
  - The 3 tagger regression tests that cover a queued scan fail against the previous `suggested.ts` and pass on the fix.
  - Zip: 15 files (manifest, 4 bundles, 3 HTML/CSS pairs, `rules.json`, 3 icons). No source maps, tests, `node_modules` or dotfiles. The bundles contain no `eval`, `new Function`, `innerHTML`, `fetch`, XHR or WebSocket. The only URLs are the two site-home links in `blocked.js`. Manifest permissions are unchanged.
  - Live YouTube and Instagram were not re-tested: the change touches only the tagger's stop path, which the unit tests cover.

## Known testing limitations

- Fixtures are hand-trimmed models of the real markup, not verbatim snapshots. They prove that the selector logic works, not that today's site still uses that markup. Only live checks prove that.
- E2E uses Playwright's bundled Chromium, not branded Chrome, which can no longer side-load extensions from the command line.
- Instagram and logged-in YouTube need real accounts. Do not automate those logins in this repository.
