# Project Operations

This repository uses pnpm from the project root, with `pnpm-lock.yaml` as its
lockfile and `package.json` for application scripts and dependencies.
ESLint is the code lint and autofix tool: use `pnpm lint` to check and
`pnpm lint:fix` to apply supported fixes. Review automatic changes before
keeping them.

## Error Recovery

- Do not repeatedly retry the same failing command or code path without changing
  the diagnosis.
- If the same error appears twice, pause and inspect the surrounding code,
  dependency docs, changelog, or issue tracker before attempting another fix.
- Identify several plausible causes, choose the smallest supported fix, and
  document any remaining uncertainty in the final response.
- Treat failing tests as evidence. Read the failure, locate the behavioral
  boundary, and avoid broad rewrites when a narrow fix is available.

## Project Configuration

- Preserve the existing package manager, build tool, module format, and path
  aliases.
- Keep `tsconfig`, bundler, lint, formatter, and test configuration changes
  minimal and task-driven.
- Prefer existing aliases such as `@/` instead of deep relative imports when the
  project already uses aliases.
- Do not loosen TypeScript, lint, or test rules to make an implementation pass.
- Do not enable source maps, analytics, or remote debugging for production
  builds unless the project has an explicit policy for it.
- Keep environment variable names documented in example files, not secret files.

## Package Management

- Use the package manager already present in the repository.
- Do not switch package managers.
- Do not update major dependencies unless explicitly requested.
- Do not add dependencies when existing code or platform APIs are sufficient.
- Prefer small, well-maintained dependencies only when they materially reduce
  complexity.

## Documentation

- Keep public documentation free of secrets, private paths, internal hostnames,
  and business-sensitive information.
- Prefer examples with placeholders.
- Update the nearest relevant documentation when changing user flows, route
  contracts, reusable component APIs, debug flags, environment variables, or
  verification workflows.
- Prefer feature-local documentation for feature-scoped behavior and broader
  docs only for shared conventions or cross-feature architecture.
- Document project-specific decisions only when they help future maintainers.
- Record a short decision note when introducing a new state library, UI library,
  data-fetching layer, routing structure, design-system primitive, or other
  cross-feature architecture choice.
- Do not create decision records for small local implementation details.
