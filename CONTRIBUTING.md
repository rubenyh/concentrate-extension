# Contributing

## Workflow

1. Read [TASKS.md](TASKS.md) and the relevant part of [ARCHITECTURE.md](ARCHITECTURE.md).
2. Branch from `main`: `feat/<topic>`, `fix/<topic>`, `docs/<topic>`, `chore/<topic>`.
3. Make a small, focused change, with tests in the same change.
4. Run `npm run check`. Also run `npm run test:e2e` if you touched `src/`, `static/` or `manifest.json`.
5. Update the docs (see below), then open a PR.

## Coding standards

- TypeScript strict. No `any`, no non-null assertions without a reason.
- Keep site-specific behavior in `static/<site>.css` (selectors) and `src/shared/classify.ts` (routes). Changing either one follows the procedure in `.claude/skills/platform-blocking/SKILL.md`.
- Selector preference: `href` or route, then custom-element tag, then semantic attribute, then localized label (marked "English UI"). Never use obfuscated class names alone, and never match free text.
- No new runtime dependencies, permissions, network calls or storage without a DECISIONS.md entry.
- Explain _why_ in comments only where the code cannot say it.

## Tests

- Routes: add cases to `tests/unit/urls.ts`. The classifier and DNR parity tests both use it.
- Selectors: add a `data-expect="hidden"` positive and a `data-expect="visible"` negative to `tests/fixtures/<site>.html`.
- Do not weaken assertions to make a test pass.

## Review expectations

- CI-equivalent checks (`npm run check`, `npm run test:e2e`) pass, and the PR says which were run.
- Any live-site claim states the date and the account state (logged in or out). Otherwise it is marked unverified.
- A permission or manifest change gets a security review.

## Conventional Commits

`<type>(<optional scope>): <imperative summary>`

| Type       | Use for                                                               |
| ---------- | --------------------------------------------------------------------- |
| `feat`     | A new blocked route or hidden surface, or a new user-visible behavior |
| `fix`      | A surface reappeared, a false positive, a guard bug                   |
| `test`     | Tests only                                                            |
| `docs`     | Docs only                                                             |
| `refactor` | No behavior change                                                    |
| `chore`    | Tooling, dependencies, release                                        |
| `ci`       | CI configuration                                                      |

Examples:

- `fix(youtube): hide Shorts in new search grid shelf`
- `feat(instagram): block /{user}/reel/{id} routes`

Use `!` or a `BREAKING CHANGE:` footer for breaking changes.

## Documentation obligations

| Change                      | Update                                       |
| --------------------------- | -------------------------------------------- |
| Any task progress           | TASKS.md (mark done only with evidence)      |
| User-visible change         | CHANGELOG.md "Unreleased"                    |
| Design or permission change | ARCHITECTURE.md and a new DECISIONS.md entry |
| Setup or command change     | README.md, CLAUDE.md                         |
| Data handling change        | PRIVACY.md, SECURITY.md                      |
| Live verification           | TESTING.md tables and verification log       |
