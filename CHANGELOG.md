# Changelog

All notable changes are documented here. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning: [SemVer](https://semver.org/).

## [Unreleased]

### Added

- Block YouTube Shorts routes (`/shorts/…`, channel Shorts tabs) and Instagram Reels routes (`/reel/…`, `/reels/…`, `/<user>/reels/`):
  - full page loads, through declarativeNetRequest redirects.
  - SPA navigation and link clicks, through a content-script route guard.
- Accessible block page with "Go back" and site-home actions.
- CSS hiding of YouTube Shorts shelves, grid items, search and related results, guide entries and the channel tab. Also hides the Instagram Reels nav link, the profile tab and reel tiles.
- Instagram home-feed filters with a toolbar popup (both on by default):
  - "Hide reels".
  - "Only show accounts I follow": hides suggested posts and ads.
  - Settings are stored in `chrome.storage.sync`, which adds the `storage` permission.
- Hiding of Instagram Explore and profile reel tiles that link as `/p/{id}/`.
- Unit, selector-fixture and Playwright E2E test suites.
- Build, packaging (`npm run package`), project documentation, and Claude Code agents, skills and rules.
- GitHub Actions CI (`.github/workflows/ci.yml`): `npm ci`, `npm audit --audit-level=moderate`, `npm audit signatures`, typecheck, lint, format check, unit tests, build and Playwright E2E. Read-only token, SHA-pinned actions.
- Dependabot (`.github/dependabot.yml`): weekly grouped npm and GitHub Actions updates with a 7-day cooldown, no auto-merge.

### Fixed

- "Only show accounts I follow" no longer re-hides a post after the toggle is turned off or after leaving the home feed: stopping the suggested-post tagger now cancels a scan already queued for the next animation frame.

### Security

- Upgraded the dev dependency jsdom from 29.1.1 to 30.1.3, which stops `XMLHttpRequest` from reusing credentials across cross-origin redirects (AIKIDO-2026-624296). The shipped extension never contained jsdom.
- Node.js requirement is now `^22.22.2 || ^24.15.0 || >=26.0.0` (jsdom 30's range), in `package.json` and `package-lock.json` alike.
