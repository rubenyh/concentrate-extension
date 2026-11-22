# Changelog

All notable changes are documented here. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning: [SemVer](https://semver.org/).

## [Unreleased]

### Added

- Block YouTube Shorts routes (`/shorts/…`, channel Shorts tabs) and Instagram Reels routes (`/reel/…`, `/reels/…`, `/<user>/reels/`):
  - full page loads, through declarativeNetRequest redirects.
  - SPA navigation and link clicks, through a content-script route guard.
- Accessible block page with "Go back" and site-home actions.
- CSS hiding of YouTube Shorts shelves, grid items, search and related results, guide entries and the channel tab. Also hides the Instagram Reels nav link, the profile tab and reel tiles.
- Unit, selector-fixture and Playwright E2E test suites.
- Build, packaging (`npm run package`), project documentation, and Claude Code agents, skills and rules.
