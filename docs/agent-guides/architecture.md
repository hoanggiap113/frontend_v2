# Architecture

Before implementing or reviewing code, also read
[`../../.agents/patterns/anti-pattern.md`](../../.agents/patterns/anti-pattern.md)
and check applicable patterns in changed components and hooks.

## Repository map

- `src/app`: application layout, providers, shared client state, and query setup.
- `src/features`: feature screens and feature-private components and logic.
- `src/router`: TanStack Router file-based routes and route composition.
- `src/components`: shared UI components and error screens.
- `src/lib`: shared services, hooks, types, configuration, and helpers.
- `src/config` and `src/styles.css`: application configuration and global styles.
- `public`: static assets. `scripts/check-architecture.mjs`: import and layer checks.

Follow existing placement and the rules enforced by `pnpm architecture`.
Do not introduce the legacy top-level folders rejected by that check.

## Code Style

- Use TypeScript for application code.
- Prefer strict types and explicit domain models over broad `any` usage.
- Use English for code comments, identifiers, logs, and messages passed to
  `throw new Error(...)`.
- Keep user-facing error messages shown in the UI in Vietnamese.
- Write documentation in the language appropriate to its intended audience.
- Keep comments short and useful. Do not explain obvious assignments.
- Preserve existing naming, formatting, import ordering, and file organization.
- Avoid unrelated refactors.
- Keep each directory easy to scan. If a folder grows large, split by feature,
  route, component family, or responsibility instead of adding unrelated files
  at the same level.

## Size And Complexity Budgets

Use these limits as default engineering budgets for new or meaningfully modified
frontend code:

- Route or page files should stay under about 700 non-blank, non-comment lines.
- Reusable components should stay under about 300 non-blank, non-comment lines.
- Functions, render helpers, and hooks should stay under about 120 non-blank,
  non-comment lines.
- Cyclomatic complexity should stay at or below 15.
- Nesting depth should stay at or below 4.
- A single `useEffect` should own one lifecycle concern only.

When existing files already exceed these budgets, keep bug fixes narrow. For
feature work, first create a small extraction point such as a hook, helper, or
child component, then add the new behavior there.

## Frontend Architecture

- Keep route components focused on composition, loading states, and data flow.
- Keep complex business rules outside presentational components.
- Put reusable UI in `src/components/` and feature-specific UI in `src/features/`.
- Put route definitions in `src/router/routes/` and screens in the relevant feature.
- Put shared API calls in `src/lib/services/`.
- Put shared hooks in `src/lib/hooks/` and shared client state in `src/app/store/`.
- Put pure helpers in `src/lib/` or the closest feature when they are private.
- Keep feature-specific code close to the feature when the repository follows a
  feature-based structure.
- Avoid creating new architecture layers for one-off needs.
- Do not mix server state, URL state, local UI state, and persisted app state in
  the same abstraction unless the existing project already has that pattern.

## Feature Boundaries

- Put new behavior in the closest existing feature, route, or page boundary.
- Do not move feature-private logic into shared `src/components/`, `src/lib/`,
  or `src/app/store/` just because it might be reusable later.
- Promote code to a shared layer only after at least two real call sites need it
  or the project already has a clear shared abstraction for that concern.
- Do not import another feature's private files. Cross-feature reuse must go
  through a stable public API, shared module, or project-approved boundary.
- Keep feature-specific types, mappers, validators, and helpers close to the
  feature unless they are truly shared domain concepts.

## Component Responsibilities

- Route or page components may coordinate routing, permissions, data loading,
  layout composition, and feature orchestration.
- Container or feature components may connect API data, stores, and business
  rules to presentational components.
- Presentational components should receive props and emit events. They should
  not call APIs, read route params, mutate global stores, or own cross-feature
  business rules.
- Form components may own local input state, but submission side effects,
  persistence, and navigation should live in a container, page, or focused hook.
- Move complex data mapping, validation, and orchestration out of JSX render
  bodies and into typed helpers, mappers, or hooks.

## Naming And Exports

- Follow existing naming conventions first.
- When the project has no convention, prefer `XxxPage.tsx` for route screens,
  `XxxLayout.tsx` for layouts, `useXxx.ts` for hooks, `xxxApi.ts` for API
  modules, `xxxStore.ts` for stores, and `xxx.types.ts` for shared types.
- Keep feature-internal helpers private to the feature directory.
- Use `index.ts` barrel files only for stable public exports. Do not export
  internal helpers, test fixtures, or implementation details through a public
  barrel.

## Component Reuse

- Prefer existing components, hooks, utilities, API clients, icons, and design
  tokens before creating new ones.
- Before building a new component, search for a close existing implementation in
  shared components, feature components, examples, and local design-system
  wrappers.
- Do not duplicate a component just to make a small visual or behavioral
  variation. Extend the existing component through its supported props or compose
  it locally when that keeps the API clear.
- Create a new reusable component only when the existing component cannot meet
  the requirement without awkward props, hidden coupling, or behavior that would
  harm existing call sites.
- When a new shared component or abstraction seems necessary, explain the gap and
  discuss it with the user unless the task explicitly asks for that abstraction.
- Keep one-off UI local to the feature until at least two real call sites need a
  shared component.
