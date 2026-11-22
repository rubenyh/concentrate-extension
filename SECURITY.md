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

| Threat                                                  | Mitigation                                                                                                                                                                                                                                      |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A site page manipulates the content script              | The isolated world shares no JS with the page. The guard reads only `location` and anchor `href`s and only performs navigation. The tagger only compares button text with "Follow": a page that fakes such a button can only hide its own post. |
| The block-page parameter is abused (XSS, open redirect) | The `from` host is checked against a fixed allowlist, and link targets come from that allowlist                                                                                                                                                 |
| Supply-chain compromise                                 | Zero runtime dependencies. Dev dependencies are locked in `package-lock.json`. Use `npm ci` and `npm audit` before releases.                                                                                                                    |
| Over-broad permissions in later changes                 | Any permission change needs a DECISIONS.md entry and a `security-reviewer` pass (`.claude/rules/content-scripts.md`)                                                                                                                            |
| Fingerprinting by the sites                             | Known: `blocked.html` is reachable from the two sites (ADR-005). Instagram can also read the `data-rsb-*` attributes on its own `<html>` and posts, which reveal that the extension is installed and which toggles are on (ADR-010). Accepted.  |

## Dependencies

- Runtime: none.
- Development: TypeScript, esbuild, Vitest, jsdom, Playwright, ESLint, Prettier and their types.
- Check with `npm audit` before each release.

## Reporting a vulnerability

Do not open a public issue. Use GitHub's private vulnerability reporting on this repository: **Security → Report a vulnerability**. Include the steps to reproduce and the affected version. Expect an acknowledgement within 7 days.
