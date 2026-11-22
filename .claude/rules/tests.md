---
paths:
  - 'tests/**'
---

# Test conventions

- Automated tests never contact live YouTube or Instagram. E2E serves `tests/fixtures/*.html` on the real hostnames via `context.route`.
- Every CSS selector needs a `data-expect="hidden"` positive and a nearby `data-expect="visible"` negative in the site fixture. `selectors.test.ts` enforces this.
- New route behavior goes into the shared table `tests/unit/urls.ts`, so the classifier test and the DNR parity test both cover it.
- Fixtures are hand-trimmed models of real markup. Keep the header comment saying so, and when markup changes, note the date it was observed.
- Never weaken an assertion to make a test pass. Fix the code or report the gap.
