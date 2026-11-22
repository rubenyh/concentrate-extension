# Privacy

This describes what the extension actually does in version 0.1.0. It is checked against the code at each release.

## Data collected

None. The extension:

- makes **no network requests** of its own.
- uses **no storage**: no `chrome.storage`, `localStorage`, IndexedDB or cookies.
- has **no analytics, telemetry, crash reporting or remote configuration**.
- has **no accounts** and no server.

## What it reads, locally

- **The URL of YouTube and Instagram tabs**: when the page loads, when the site navigates, and the `href` of a link you click. It compares the URL against fixed patterns to decide whether to block it. The result is never stored or sent anywhere.
- **Page loads to those sites**: Chrome's declarativeNetRequest engine matches them against the extension's static rules. Chrome evaluates the rules, and the extension's code does not see the requests.

The extension does not run on any other website.

## Retention

Nothing is retained. All decisions are made in memory and discarded.

## Third parties

None. YouTube's and Instagram's own data practices are unchanged by this extension.

## Changes

Any change to this behavior will be listed in CHANGELOG.md and in this file before release.
