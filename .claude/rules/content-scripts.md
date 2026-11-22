---
paths:
  - 'src/**'
  - 'static/**'
  - 'manifest.json'
---

# Extension runtime constraints

- No network access of any kind (`fetch`, XHR, beacons, sockets, remote scripts or styles), no telemetry, no `chrome.storage` of browsing data.
- No `eval`, `new Function`, `innerHTML` or other HTML string injection. Write text with `textContent`.
- Treat page data and URL parameters as untrusted. Accept only allowlisted values (see `src/blocked.ts`).
- Route decisions live only in `src/shared/classify.ts`, mirrored by `static/rules.json`. Hide selectors live only in `static/<site>.css`. Do not scatter selectors or route checks into TypeScript.
- Content scripts are classic scripts bundled to IIFE by esbuild. Import shared code. Never rely on ES module loading at runtime.
- Do not add a MutationObserver, polling or a background service worker without a documented need. CSS `:has()` already handles late-rendered content (DECISIONS.md ADR-003).
- Any permission or host change needs a DECISIONS.md entry and a `security-reviewer` pass.
