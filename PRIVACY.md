# Privacy

This describes what the extension actually does in version 0.1.0. It is checked against the code at each release.

## Data collected

None. The extension:

- makes **no network requests** of its own.
- stores **only its two settings**: the popup toggles ("Hide reels", "Only show accounts I follow") are kept as two true/false values in `chrome.storage.sync`. If you use Chrome sync, Chrome syncs them to your other Chrome profiles through your Google account, like any extension setting. Nothing else is stored: no `localStorage`, IndexedDB, cookies or browsing data.
- has **no analytics, telemetry, crash reporting or remote configuration**.
- has **no accounts** and no server.

## What it reads, locally

- **The URL of YouTube and Instagram tabs**: when the page loads, when the site navigates, and the `href` of a link you click. It compares the URL against fixed patterns to decide whether to block it. The result is never stored or sent anywhere.
- **Page loads to those sites**: Chrome's declarativeNetRequest engine matches them against the extension's static rules. Chrome evaluates the rules, and the extension's code does not see the requests.
- **Button text in Instagram home-feed posts**, only on the home feed and only when "Only show accounts I follow" is on: it compares the text of each button inside a post with "Follow", in order to hide posts from accounts you do not follow. That text can include usernames. It is compared in memory and never stored or sent anywhere. Reading stops as soon as you turn the toggle off or leave the home feed.

The extension does not run on any other website.

## Retention

Only the two settings are retained, until you change them or remove the extension. All blocking and hiding decisions are made in memory and discarded.

## Third parties

None. YouTube's and Instagram's own data practices are unchanged by this extension.

## Changes

Any change to this behavior will be listed in CHANGELOG.md and in this file before release.
