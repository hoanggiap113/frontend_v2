# Verification

## Testing Strategy

- Test pure logic, formatting, data mapping, hooks, and complex component state.
- Add integration or component tests for critical user flows when the change
  affects routing, forms, permissions, API errors, or async states.
- Mock network calls at the API boundary rather than inside UI details.
- Cover loading, empty, error, and permission states when they are part of the
  changed behavior.
- Prefer regression tests for bug fixes: write or update a test that would have
  failed before the fix when the project test setup makes that practical.
- Test validators, mappers, formatters, and state transitions directly before
  reaching for heavier page tests.
- Do not add brittle tests that assert implementation details unrelated to user
  behavior.

## Verification

Before finishing, run the smallest relevant verification command available:

- `pnpm architecture` for import boundaries and layer changes.
- `pnpm typecheck` for TypeScript changes.
- `pnpm lint` for code changes. It runs ESLint with zero warnings allowed.
- `pnpm test` for relevant unit or component tests when tests exist.
- `pnpm build` for React UI, routing, or production bundle changes.
- `pnpm validate` for a broad handoff; it runs architecture, typecheck, lint,
  and build.
- Check the rendered UI at the target width and a narrow width for UI-heavy
  changes when a browser is available.

If a command cannot be run, explain why and state the remaining risk.

Prefer targeted verification first. For example, run the specific component or
feature tests touched by the change before expanding to full test suites.
After each completed feature, run the full `pnpm lint` command and resolve all
errors and warnings before reporting completion. Use `pnpm lint:fix` for safe
automatic fixes, then review its diff and rerun `pnpm lint`. A production-ready
handoff must have a passing lint result.

## Final Self-Check

Before finishing, verify:

- Changed code was reviewed against the applicable rules in
  `.agents/patterns/anti-pattern.md`.

- Existing components, hooks, utilities, API clients, icons, and tokens were
  reused where practical.
- Feature-private logic did not leak into shared directories unnecessarily.
- State lives at the correct owner: local component, URL, server cache, global
  store, or persistence.
- API errors are surfaced once and authentication failures follow the existing
  global flow.
- Forms keep validation, Enter submission, disabled state, loading state, and
  payload mapping on one coherent path.
- Loading, empty, error, permission, and narrow viewport states were considered
  when affected.
- The smallest relevant verification ran, or any skipped command is explained
  with residual risk.
- `pnpm lint` passed after the feature was completed.
