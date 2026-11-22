# Reels & Shorts Blocker

A Chrome extension (Manifest V3) that blocks **Instagram Reels** and **YouTube Shorts**. Regular videos, posts, stories, messages, playlists and subscriptions keep working.

It runs entirely in your browser. It has no accounts, no servers and no analytics. It stores only its two on/off settings.

## Features

- Opening a Short or Reel shows a "blocked" page instead of the video. This covers a pasted link, a link from another site, a new tab, a reload, an in-site click, and Back/Forward.
- Blocked routes:
  - YouTube: `/shorts/…` and channel Shorts tabs, on `www.`, `m.` and `youtube.com`.
  - Instagram: `/reel/…`, `/reels/…`, `/<user>/reels/`.
- YouTube: hides Shorts shelves, Shorts in the home grid, search and related results, the sidebar Shorts entry, and the channel Shorts tab.
- Instagram: hides the Reels nav link, the profile Reels tab, and reel tiles in profile and Explore grids.
- Instagram home feed, each part switchable in the toolbar popup:
  - **Hide reels**: removes reel posts.
  - **Only show accounts I follow**: removes suggested posts from accounts you don't follow, and ads.
- New content (infinite scroll, in-app navigation) is filtered automatically, with no reload.

## Requirements

- Chrome 120 or later (desktop).
- For development: Node.js 22 or later and npm.

## Install (unpacked)

1. `npm ci && npm run build`
2. Open `chrome://extensions` and turn on **Developer mode**.
3. Click **Load unpacked** and select the `dist/` folder.
4. Open YouTube or Instagram tabs that were already open before install, or reload them. Content scripts attach only to pages loaded after install. Route blocking of new page loads works immediately.

## Development

| Command            | What it does                                                                                             |
| ------------------ | -------------------------------------------------------------------------------------------------------- |
| `npm run build`    | Bundle into `dist/`                                                                                      |
| `npm run check`    | Typecheck, lint, format check, unit tests                                                                |
| `npm run test:e2e` | Build, then run Playwright against the unpacked extension (first run: `npx playwright install chromium`) |
| `npm run package`  | Build plus `reels-shorts-blocker-<version>.zip` for the Chrome Web Store                                 |
| `npm run format`   | Format with Prettier                                                                                     |

After changing code, run `npm run build` and click the reload icon on the extension card in `chrome://extensions`.

Project docs:

- [PRODUCT.md](PRODUCT.md): what it does.
- [ARCHITECTURE.md](ARCHITECTURE.md): how it works.
- [TASKS.md](TASKS.md): what is left.
- [TESTING.md](TESTING.md), [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md), [PRIVACY.md](PRIVACY.md), [DECISIONS.md](DECISIONS.md), [CHANGELOG.md](CHANGELOG.md).

## Known limitations

- YouTube and Instagram change their page markup often. Hidden entry points can reappear until the selectors are updated. Route blocking does not depend on markup.
- The YouTube sidebar "Shorts" entry and the channel "Shorts" tab are matched by their English labels. In other UI languages they stay visible, but opening them is still blocked.
- "Only show accounts I follow" recognizes suggested posts by Instagram's English "Follow" button. In other languages, only ads are removed.
- A reel opened through a normal post link (`/p/…`, for example from Explore or a shared link) is not blocked.
- YouTube and Instagram can detect that this extension is installed, because the block page must be web-accessible to them.

## Troubleshooting

- **Shorts still visible in an open tab**: reload the tab once after installing or updating the extension.
- **A Shorts surface reappeared**: the site changed its markup. Open an issue with the page URL and, if possible, the element's HTML from DevTools.
- **"Go back" does nothing on the block page**: the tab has no history (for example, a link opened in a new tab). Use "Open … home" instead.
- **E2E fails with a browser launch error**: run `npx playwright install chromium`. Branded Chrome cannot side-load extensions from the command line.
