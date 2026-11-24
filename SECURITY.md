# Security

## Principles

- **Least privilege**: two permissions (`declarativeNetRequestWithHostAccess`, `storage`) and four host patterns. No `<all_urls>`.
- **No remote code**:
  - Everything that runs ships in the package.
  - Nothing is fetched, evaluated or injected as HTML.
  - A strict extension-pages CSP applies: `script-src 'self'; object-src 'self'; frame-ancestors 'none'`.
- **Untrusted input stays inert**: the guard reads only `location` and the `href` of a clicked link, and only classifies them. Block-page URLs are built from `location.hostname`, never from a link. On the Instagram home feed, the suggested-post tagger reads button text inside posts, compares it with a fixed string, and writes only the `data-rsb-suggested` attribute. The block page's only parameter (`?from=`) is accepted only if it is in an allowlist, and it is written with `textContent`.
- **Reviewable build**: the bundles are not minified, so the shipped code reads like the source.

## Permissions

| Permission                                                                      | Why                                                                     |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `storage`                                                                       | Saves the two popup toggles in `chrome.storage.sync`. No browsing data. |
| `declarativeNetRequestWithHostAccess`                                           | Static rules redirect Shorts/Reels page loads to the block page         |
| `https://www.youtube.com/*`, `https://m.youtube.com/*`, `https://youtube.com/*` | DNR redirects and content scripts on YouTube                            |
| `https://www.instagram.com/*`                                                   | DNR redirects and content scripts on Instagram                          |

`blocked.html` is web-accessible to those hosts only, because Chrome requires this for DNR redirect targets.

## Threat considerations

| Threat                                                  | Mitigation                                                                                                                                                                                                                                                                                              |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A site page manipulates the content script              | The isolated world shares no JS with the page. The guard reads only `location` and anchor `href`s and only performs navigation. The tagger only compares button text with "Follow": a page that fakes such a button can only hide its own post.                                                         |
| The block-page parameter is abused (XSS, open redirect) | The `from` host is checked against a fixed allowlist, and link targets come from that allowlist                                                                                                                                                                                                         |
| Supply-chain compromise                                 | Zero runtime dependencies. Dev dependencies are locked in `package-lock.json`. CI installs with `npm ci` and fails on `npm audit --audit-level=moderate` or a bad registry signature (`npm audit signatures`). Dependabot proposes updates weekly after a 7-day cooldown; nothing merges automatically. |
| Over-broad permissions in later changes                 | Any permission change needs a DECISIONS.md entry and a `security-reviewer` pass (`.claude/rules/content-scripts.md`)                                                                                                                                                                                    |
| Fingerprinting by the sites                             | Known: `blocked.html` is reachable from the two sites (ADR-005). Instagram can also read the `data-rsb-*` attributes on its own `<html>` and posts, which reveal that the extension is installed and which toggles are on (ADR-010). Accepted.                                                          |

## Dependencies

- Runtime: none.
- Development: TypeScript, esbuild, Vitest, jsdom, Playwright, ESLint, Prettier and their types.
- Node.js: `^22.22.2 || ^24.15.0 || >=26.0.0`, the strictest `engines` range among the locked dev dependencies (jsdom 30). CI uses the latest Node 22.
- CI (`.github/workflows/ci.yml`) runs `npm audit --audit-level=moderate` and `npm audit signatures` on every pull request and push to `main`. Run `npm audit` before each release too.
- Dependabot (`.github/dependabot.yml`) checks npm and GitHub Actions weekly. Minor and patch dev-dependency updates come grouped, majors one by one, all actions in one group. A 7-day cooldown delays non-security updates. No auto-merge.

### CI hardening

- Triggers: `pull_request` and `push` to `main`, plus `workflow_dispatch`. No `pull_request_target`, so PR code never runs with write access or secrets.
- `permissions: contents: read`, checkout with `persist-credentials: false`, no secrets, no uploaded artifacts.
- Actions pinned to full commit SHAs, with the tag in a comment. Dependabot updates the pins.
- One run per PR or branch (`concurrency` cancels superseded runs), 20-minute timeout.

### Accepted risks

- `npm ci` runs dev-dependency install scripts (esbuild, Playwright) on CI and developer machines. Mitigated by the lockfile with integrity hashes, signature verification, the Dependabot cooldown and a read-only CI token.
- `scripts/build.mjs` copies all of `static/` into `dist/`, so a stray untracked file there would ship. The release procedure lists the zip contents before upload (`.claude/skills/release-preparation`).

### Audit log

- 2026-11-23: jsdom 29.1.1 → 30.1.3 (dev only, used by Vitest selector tests). Fixes `XMLHttpRequest` reusing `xhr.open()` credentials and cookies across cross-origin redirects (jsdom 30.1.3 release notes; reported to us as AIKIDO-2026-624296, affecting 16.6.0–30.1.2). Not reachable in the shipped extension, which contains no jsdom; in tests jsdom never makes network requests. 31.x is the next major and was not needed.
- 2026-11-23: the Instagram suggested-post tagger could run one scan after it was stopped, because stop did not cancel a scan already queued with `requestAnimationFrame`. That scan re-tagged posts after the toggle went off or the user left the home feed. Fixed with `cancelAnimationFrame`; regression tests in `tests/unit/suggested.test.ts`. Impact was functional (posts briefly hidden after opting out), not a data exposure.
- 2026-11-23: fresh review (`security-reviewer`): no blockers. `npm audit` 0 vulnerabilities, `npm audit signatures` verified.

## Reporting a vulnerability

Do not open a public issue. Use GitHub's private vulnerability reporting on this repository: **Security → Report a vulnerability**. Include the steps to reproduce and the affected version. Expect an acknowledgement within 7 days.
