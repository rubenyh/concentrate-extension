# AGENTS.md

Guidance for any coding agent or tool working in this repository. Claude Code also reads [CLAUDE.md](CLAUDE.md), which links the same sources.

- **What it is**: a Manifest V3 Chrome extension that blocks YouTube Shorts and Instagram Reels. See [PRODUCT.md](PRODUCT.md).
- **How it works**: DNR rules plus an SPA route guard block the routes, and CSS `:has()` rules hide the surfaces. See [ARCHITECTURE.md](ARCHITECTURE.md).
- **Boundaries**:
  - Route decisions live only in `src/shared/classify.ts`, mirrored by `static/rules.json`.
  - Selectors live only in `static/<site>.css`.
  - No network, storage, telemetry or remote code.
  - No new permissions without a [DECISIONS.md](DECISIONS.md) entry.
- **Before committing**: `npm run check` must pass. If you touched the guard, rules, CSS or manifest, also run `npm run test:e2e`.
- **Tests**:
  - New routes go in `tests/unit/urls.ts`.
  - New selectors need positive and negative markup in `tests/fixtures/<site>.html`.
  - No live-site calls in automated tests.
- **Docs**:
  - Update [TASKS.md](TASKS.md) and [CHANGELOG.md](CHANGELOG.md) with the change.
  - Record design changes in ARCHITECTURE.md and DECISIONS.md.
- **Commits**: Conventional Commits, as in [CONTRIBUTING.md](CONTRIBUTING.md).
