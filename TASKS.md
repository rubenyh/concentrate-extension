# Tasks

Status: `done` (acceptance verified, with evidence), `open`, `blocked`. Priority: P0 (MVP) to P2 (later).

## M1 — Tooling (done)

| Task                                                             | P   | Status | Acceptance / evidence                                                                   |
| ---------------------------------------------------------------- | --- | ------ | --------------------------------------------------------------------------------------- |
| TypeScript strict, ESLint, Prettier, Vitest, esbuild build + zip | P0  | done   | `npm run check` exits 0. `npm run package` writes a valid zip (listed with `unzip -l`). |

## M2 — Claude Code infrastructure and docs (done)

| Task                                                               | P   | Status | Acceptance / evidence                                                                                         |
| ------------------------------------------------------------------ | --- | ------ | ------------------------------------------------------------------------------------------------------------- |
| Agents `platform-specialist`, `test-engineer`, `security-reviewer` | P0  | done   | `.claude/agents/*.md` frontmatter follows code.claude.com/docs/en/sub-agents (`name`, `description`, `tools`) |
| Skills `platform-blocking`, `release-preparation`                  | P0  | done   | `.claude/skills/*/SKILL.md`                                                                                   |
| Rules `content-scripts`, `tests`                                   | P0  | done   | `.claude/rules/*.md` with `paths:`                                                                            |
| Project docs                                                       | P0  | done   | This file and the files linked from README.md                                                                 |

## M3 — Route classification + DNR (done)

| Task                                | P   | Status | Depends  | Acceptance / evidence                                         |
| ----------------------------------- | --- | ------ | -------- | ------------------------------------------------------------- |
| `classify.ts` for YouTube/Instagram | P0  | done   | M1       | 50 URL table cases pass (`tests/unit/classify.test.ts`)       |
| `rules.json` mirrored + parity test | P0  | done   | classify | `tests/unit/rules.test.ts` passes. E2E direct loads redirect. |

## M4 — Route guard + block page (done)

| Task                                                    | P   | Status | Depends | Acceptance / evidence                                        |
| ------------------------------------------------------- | --- | ------ | ------- | ------------------------------------------------------------ |
| Guard: start check, `currententrychange`, click capture | P0  | done   | M3      | E2E: pushState, click, Back/Forward tests pass               |
| Accessible block page (Back / site home)                | P0  | done   |         | E2E: heading visible, "Go back" returns, fresh-tab home link |

## M5 — Surface hiding (done)

| Task                     | P   | Status               | Acceptance / evidence                                                                 |
| ------------------------ | --- | -------------------- | ------------------------------------------------------------------------------------- |
| YouTube CSS + fixtures   | P0  | done                 | `selectors.test.ts` and E2E pass. Live check 2026-11-21 (logged out): see TESTING.md. |
| Instagram CSS + fixtures | P0  | done (fixtures only) | `selectors.test.ts` and E2E pass. Not checked live: needs login.                      |

## M6 — E2E (done)

| Task                                | P   | Status | Acceptance / evidence                      |
| ----------------------------------- | --- | ------ | ------------------------------------------ |
| Playwright suite on built extension | P0  | done   | `npm run test:e2e`: 14 passed (2026-11-21) |

## M7 — Release readiness

| Task                                                       | P   | Status         | Depends      | Acceptance / evidence                                                                                                                             |
| ---------------------------------------------------------- | --- | -------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Icons 16/48/128                                            | P0  | done           |              | `static/icons/`, referenced in the manifest                                                                                                       |
| Security review                                            | P0  | done           |              | 2026-11-21: 0 blockers, 0 should-fix, 5 notes. Notes applied: ADR-009 and SECURITY.md wording.                                                    |
| Live Instagram verification                                | P0  | done (partial) |              | 2026-11-21: surfaces and feed filters pass live (TESTING.md I2–I7). Still open: I1 route blocking with the extension installed, stories/DMs (I5). |
| Live logged-in YouTube home feed check                     | P1  | **open**       | user account | Logged-out home showed no feed, so the home shelves are verified only against fixtures                                                            |
| Load in branded Chrome via "Load unpacked"                 | P0  | **open**       | user         | Automated checks use bundled Chromium. The user confirms in Chrome 157.                                                                           |
| Chrome Web Store listing (screenshots, justification text) | P2  | open           |              | Not required for the MVP. In the dashboard, declare "no user data collected" (PRIVACY.md).                                                        |

## M8 — Instagram home-feed toggles (done)

| Task                                                          | P   | Status   | Acceptance / evidence                                        |
| ------------------------------------------------------------- | --- | -------- | ------------------------------------------------------------ |
| Popup + `chrome.storage.sync` toggles                         | P0  | done     | E2E "popup toggles update Instagram home-feed filters live"  |
| Hide feed reels                                               | P0  | done     | Unit toggle tests, E2E, live I6/I7                           |
| Hide suggested posts and ads (followed only)                  | P0  | done     | Unit toggle tests, E2E incl. late-rendered posts, live I6/I7 |
| Hide Explore/profile reel tiles linked as `/p/`               | P1  | done     | Live I4: 44/44 hidden, 0 false positives                     |
| Install unpacked build in the user's Chrome and re-run I1, I5 | P0  | **open** | User loads `dist/`                                           |

## Backlog

| Task                                                 | P   | Notes                                              |
| ---------------------------------------------------- | --- | -------------------------------------------------- |
| Localized Instagram "Follow" label for followed-only | P1  | English only today (ADR-011)                       |
| Localized YouTube guide/tab matching                 | P1  | Currently matches English `title`/`tab-title` only |
| Popup toggle / snooze                                | P2  | Needs `storage`. Revisit on user demand.           |
| Edge / Firefox packaging                             | P2  | Firefox needs a `browser_specific_settings` review |
| Legacy `youtube.com/<name>/shorts` route blocking    | P2  | Ambiguous path shape. The tab is hidden already.   |
