# Security

## Principles

- **Least privilege**: one permission and four host patterns. No `<all_urls>`.
- **No remote code**:
  - Everything that runs ships in the package.
  - Nothing is fetched, evaluated or injected as HTML.
  - The MV3 default CSP applies.
- **Untrusted input stays inert**: page content is never read into code paths. The block page's only parameter (`?from=`) is accepted only if it is in an allowlist, and it is written with `textContent`.
- **Reviewable build**: the bundles are not minified, so the shipped code reads like the source.

## Permissions

| Permission                                                          | Why                                                             |
| ------------------------------------------------------------------- | --------------------------------------------------------------- |
| `declarativeNetRequestWithHostAccess`                               | Static rules redirect Shorts/Reels page loads to the block page |
| `*://www.youtube.com/*`, `*://m.youtube.com/*`, `*://youtube.com/*` | DNR redirects and content scripts on YouTube                    |
| `*://www.instagram.com/*`                                           | DNR redirects and content scripts on Instagram                  |

`blocked.html` is web-accessible to those hosts only, because Chrome requires this for DNR redirect targets.

## Threat considerations

| Threat                                                  | Mitigation                                                                                                                      |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| A site page manipulates the content script              | The isolated world shares no JS with the page. The guard reads only `location` and anchor `href`s and only performs navigation. |
| The block-page parameter is abused (XSS, open redirect) | The `from` host is checked against a fixed allowlist, and link targets come from that allowlist                                 |
| Supply-chain compromise                                 | Zero runtime dependencies. Dev dependencies are locked in `package-lock.json`. Use `npm ci` and `npm audit` before releases.    |
| Over-broad permissions in later changes                 | Any permission change needs a DECISIONS.md entry and a `security-reviewer` pass (`.claude/rules/content-scripts.md`)            |
| Fingerprinting by the sites                             | Known: `blocked.html` is reachable from the two sites (ADR-005)                                                                 |

## Dependencies

- Runtime: none.
- Development: TypeScript, esbuild, Vitest, jsdom, Playwright, ESLint, Prettier and their types.
- Check with `npm audit` before each release.

## Reporting a vulnerability

Do not open a public issue. Use GitHub's private vulnerability reporting on this repository: **Security → Report a vulnerability**. Include the steps to reproduce and the affected version. Expect an acknowledgement within 7 days.
