# Testing

## Strategy

| Layer            | Tool                                            | What it proves                                                                                                                                      |
| ---------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit: routes     | Vitest (`tests/unit/classify.test.ts`)          | The classifier gets blocked and allowed URLs right, including query, slash, case, host and look-alike prefixes                                      |
| Unit: DNR parity | Vitest (`tests/unit/rules.test.ts`)             | `static/rules.json` regexes agree with the classifier on the same table (`tests/unit/urls.ts`)                                                      |
| Unit: selectors  | Vitest + jsdom (`tests/unit/selectors.test.ts`) | Every CSS selector hides a Shorts/Reels fixture element, none touches a regular one, and each selector has a positive fixture                       |
| E2E              | Playwright (`tests/e2e/extension.spec.ts`)      | The built `dist/` in real Chromium: DNR redirects, SPA guard, click interception, Back/Forward, the block page, and computed visibility on fixtures |
| Live             | Manual checklist below                          | Behavior on the real sites, which change without notice                                                                                             |

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

| #   | Step                                                   | Expected                                           | Result     |
| --- | ------------------------------------------------------ | -------------------------------------------------- | ---------- |
| I1  | Open `https://www.instagram.com/reels/`                | Block page                                         | Unverified |
| I2  | Sidebar                                                | No Reels link                                      | Unverified |
| I3  | Open a profile with reels                              | No Reels tab, no reel tiles in the grid            | Unverified |
| I4  | Click a reel from Explore or search, if any is visible | Block page                                         | Unverified |
| I5  | Open a regular post, view stories, send a DM           | Work normally                                      | Unverified |
| I6  | Scroll the home feed                                   | Note any reel cards still shown (known limitation) | Unverified |

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
  - Instagram live: not run.
  - Security review (general-purpose agent following `.claude/agents/security-reviewer.md`): no blockers, `npm audit` reports 0 vulnerabilities.
  - After ADR-009 (https-only hosts and CSP): `npm run check` and `npm run test:e2e` (14) still pass.

## Known testing limitations

- Fixtures are hand-trimmed models of the real markup, not verbatim snapshots. They prove that the selector logic works, not that today's site still uses that markup. Only live checks prove that.
- E2E uses Playwright's bundled Chromium, not branded Chrome, which can no longer side-load extensions from the command line.
- Instagram and logged-in YouTube need real accounts. Do not automate those logins in this repository.
