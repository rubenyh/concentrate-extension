# CLAUDE.md

Chrome Manifest V3 extension that blocks Instagram Reels and YouTube Shorts and leaves the rest of both sites working. It has no backend, no runtime dependencies, no storage and no telemetry.

## Architecture in one paragraph

Two layers. **Route blocking** (hard guarantee):

- `static/rules.json` DNR rules redirect full page loads of Shorts/Reels URLs to `blocked.html`.
- `src/shared/guard.ts` catches SPA navigation (Navigation API `currententrychange`) and in-page link clicks (capture phase).
- Both follow `src/shared/classify.ts`.

**Surface hiding** (best effort): `static/youtube.css` and `static/instagram.css` use `:has()` selectors injected via `content_scripts.css`. This covers late-rendered content with no JS.

Details: [ARCHITECTURE.md](ARCHITECTURE.md). Decisions: [DECISIONS.md](DECISIONS.md).

## Layout

- `src/shared/`: classifier and guard (pure TS).
- `src/content/`: per-site entry points.
- `src/blocked.ts`: block page.
- `static/`: CSS, DNR rules, HTML and icons, copied verbatim to `dist/`.
- `manifest.json`: copied to `dist/`.
- `tests/unit/` (Vitest + jsdom), `tests/e2e/` (Playwright, built extension), `tests/fixtures/` (markup models).
- `scripts/build.mjs`: esbuild bundle, plus a zip with `--zip`.

## Commands

| Command                             | Purpose                                                                                        |
| ----------------------------------- | ---------------------------------------------------------------------------------------------- |
| `npm run check`                     | typecheck + lint + format check + unit tests (run before every commit)                         |
| `npm run test:e2e`                  | build, then Playwright E2E in bundled Chromium (run when guard, rules, CSS or manifest change) |
| `npm run build` / `npm run package` | `dist/` / `reels-shorts-blocker-<version>.zip`                                                 |
| `npm run format`                    | Prettier write                                                                                 |

## Working rules

- Read [TASKS.md](TASKS.md) before starting. Update it, and CHANGELOG.md for user-visible changes, in the same change.
- Commit with Conventional Commits (see CONTRIBUTING.md), one logical change per commit.
- Change routes or selectors only through the `platform-blocking` skill. The classifier, `rules.json`, CSS, fixtures and tests must stay in sync.
- Never report live-site behavior as verified unless it was run. Mark it UNVERIFIED and say why.
- Path-scoped constraints live in `.claude/rules/`: runtime security in `content-scripts.md`, tests in `tests.md`.

## Delegation

- `platform-specialist` (read-only): investigate site markup and route changes before editing selectors or patterns.
- `test-engineer`: extend tests or prove acceptance criteria.
- `security-reviewer` (read-only): before any release, permission change, or new dependency.
- `/release-preparation`: user-invoked release procedure.
