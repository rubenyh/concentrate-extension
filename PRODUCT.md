# Product

## Vision

People can use YouTube and Instagram for what they came for (videos they chose, posts, stories, messages) without being pulled into endless short-form video feeds.

## Problem

Shorts and Reels are woven into both sites: navigation tabs, home-page shelves, search results, profile grids and shared links. Hiding a single button is not enough. Users still land on a Short through a shared link, a search result or the Back button. Existing settings on both platforms do not offer a way to turn the feature off.

## Target users

Desktop Chrome users who want to keep YouTube and Instagram but cut out short-form video. This includes students, knowledge workers and people managing their attention or screen time.

## Core functionality

1. Opening a Shorts/Reels URL in any way shows a "blocked" page instead of the video. This covers a pasted link, a link from another site, a new tab, an in-site click, Back/Forward, or a reload.
2. Shorts/Reels entry points are hidden where they can be reliably identified.
3. Everything else on both sites keeps working.

## User journeys

- **Shared link**: a friend sends a `youtube.com/shorts/…` link. The user clicks it and sees "Short-form video blocked", with "Go back" and "Open YouTube home".
- **Browsing**:
  - On the YouTube home page and in search, no Shorts shelves, Shorts results or Shorts sidebar entry appear.
  - On a channel, the Shorts tab is gone.
  - The user watches regular videos normally.
- **Instagram**:
  - The home feed shows only posts from accounts the user follows, without reels or ads. Each filter can be switched off in the toolbar popup.
  - The Reels nav item and the profile Reels tab are gone, and reel tiles are hidden in grids.
  - Posts, stories and DMs work.
  - Opening a reel link shows the block page.

## Functional requirements

| ID  | Requirement                                                                                                                                                                         |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | Block YouTube `/shorts`, `/shorts/{id}` and channel Shorts tabs (`/@h/shorts`, `/channel/{id}/shorts`, `/c/{n}/shorts`, `/user/{n}/shorts`) on `www.`, `m.` and bare `youtube.com`. |
| F2  | Block Instagram `/reel/{id}`, `/reels/…`, `/{user}/reels/` and `/{user}/reel/{id}`.                                                                                                 |
| F3  | Blocking applies to full loads, SPA navigation, link clicks, Back/Forward and reloads.                                                                                              |
| F4  | The block page is accessible, explains what happened, and offers Back and site-home actions without loops.                                                                          |
| F5  | Hide YouTube Shorts shelves, grid items, search and related results, the sidebar entries and the channel tab.                                                                       |
| F6  | Hide the Instagram Reels nav link, the profile Reels tab and reel tiles.                                                                                                            |
| F8  | Instagram home feed, toggle "Hide reels" (default on): hide reel posts.                                                                                                             |
| F9  | Instagram home feed, toggle "Only show accounts I follow" (default on): hide suggested posts from unfollowed accounts, and ads.                                                     |
| F7  | Content rendered later (infinite scroll, SPA page changes) is filtered automatically.                                                                                               |

## Nonfunctional requirements

- **Privacy**: no data collection, network requests or accounts. The only stored data is the two toggle values.
- **Least privilege**: only `declarativeNetRequestWithHostAccess` and four host patterns.
- **Performance**: no polling. Per page there is one click listener and one navigation listener. On Instagram, one MutationObserver runs only while "Only show accounts I follow" is on.
- **Maintainability**: selectors and routes are centralized, and each is pinned by tests.
- **Compatibility**: Chrome 120 or later (Navigation API, CSS `:has()`).

## MVP scope

F1–F7, with automated unit and E2E tests and a manual live checklist.

## Out of scope

- Mobile apps, and browsers other than Chrome (Edge likely works, but this is unverified).
- Toggles for route blocking or YouTube surfaces, schedules, snooze.
- Shorts embedded on third-party sites.

## Acceptance criteria

The MVP is done when all of the following are true and evidenced in [TASKS.md](TASKS.md):

- The production build loads in Chrome.
- F1–F3 pass E2E.
- F5–F6 pass the selector and E2E fixture tests.
- YouTube live checks are recorded.
- Permissions are reviewed.
- Limitations are documented.

## Future enhancements

- Snooze, and toggles for YouTube surfaces.
- Localized label matching for the YouTube guide and tab entries.
- Edge and Firefox packaging.
- Optional blocking of the YouTube home feed or Instagram Explore.
