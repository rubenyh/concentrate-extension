---
name: platform-blocking
description: Procedure to add or update a blocked Shorts/Reels route or a hide selector for YouTube or Instagram, keeping the classifier, DNR rules, CSS, fixtures and tests in sync. Use whenever src/shared/classify.ts, static/rules.json, static/youtube.css or static/instagram.css must change.
---

# Updating platform blocking

The extension blocks at two layers. Change the right one:

| Problem                                                         | Layer | Files                                                |
| --------------------------------------------------------------- | ----- | ---------------------------------------------------- |
| A Shorts/Reels **page** opens (direct link, SPA navigation)     | Route | `src/shared/classify.ts` **and** `static/rules.json` |
| A Shorts/Reels **thumbnail, shelf, tab or nav item** is visible | Hide  | `static/youtube.css` or `static/instagram.css`       |

## Route change

1. Add the new URLs to `tests/unit/urls.ts`, both blocked cases and allowed look-alikes (query string, trailing slash, uppercase, other host, a prefix such as `/shortsfan`).
2. Update `isBlockedYouTube` / `isBlockedInstagram` in `src/shared/classify.ts`. Compare whole path segments, never substrings.
3. Update the matching `regexFilter` in `static/rules.json`. DNR uses RE2: no lookahead or backreferences. To carve out an exception, add a higher-`priority` `allow` rule (see rule 3).
4. Run `npm test`. `rules.test.ts` fails if the regex and the classifier disagree on any URL.

## Selector change

1. Get evidence for the markup first (delegate to the `platform-specialist` agent if needed).
2. Pick the most stable hook: `href` > custom-element tag > semantic attribute > localized label (mark as "English UI" in a CSS comment).
3. Hide the smallest element that removes the surface. Anchor every `:has()` on a specific tag, never `*:has()` or a bare attribute, so style recalculation stays cheap.
4. Add markup to `tests/fixtures/<site>.html`: a `data-expect="hidden"` positive and a `data-expect="visible"` negative that the selector could plausibly over-match.
5. Run `npm test`. `selectors.test.ts` fails if any selector lacks a positive fixture or touches a visible element.

## Finish

1. Run `npm run check` and `npm run test:e2e`.
2. If live access is possible, repeat the relevant check from TESTING.md "Live checks" and record the date and result there.
3. Update TASKS.md and CHANGELOG.md, then commit with `fix:` (broken surface) or `feat:` (new surface).
