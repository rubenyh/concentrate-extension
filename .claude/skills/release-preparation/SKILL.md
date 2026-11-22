---
name: release-preparation
description: Prepare a versioned, Chrome-installable release zip with checks, manifest and permission review, and documentation sync. Use only when the user asks to cut or prepare a release.
disable-model-invocation: true
---

# Release preparation

Stop and report at the first failing step. Do not skip steps.

1. **Clean tree**: `git status` shows no uncommitted changes.
2. **Version**: bump `version` in `manifest.json` and `package.json` to the same SemVer value.
3. **Checks**: `npm ci`, `npm run check`, `npm run test:e2e`. All must exit 0.
4. **Review**: delegate to the `security-reviewer` agent. Any BLOCKER stops the release.
5. **Manifest sanity** (in the built `dist/manifest.json`):
   - `manifest_version` is 3.
   - Permissions are only `declarativeNetRequestWithHostAccess`.
   - Host patterns are only the YouTube and Instagram hosts.
   - Icons at 16, 48 and 128 exist.
6. **Package**: `npm run package` writes `reels-shorts-blocker-<version>.zip` from `dist/`. List its contents and confirm no source maps, tests or `node_modules`.
7. **Smoke test**: load `dist/` via `chrome://extensions` → Load unpacked, if a browser is available. Otherwise say it is unverified.
8. **Docs**:
   - Move the CHANGELOG "Unreleased" entries under the new version with today's date.
   - Update TASKS.md.
   - Make sure PRIVACY.md still matches the code.
9. **Commit**: `chore(release): v<version>`, then tag `v<version>`. Push only if the user asks.

Report the zip path, the check results and any unverified items.
