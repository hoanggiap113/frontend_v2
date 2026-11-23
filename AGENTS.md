# Agent workflow for Chat Quality Agent Frontend

This file applies to every task in this React repository. The main agent handles
planning, implementation, review, verification, and handoff without subagents.
Read this file first, then load the reference guides relevant to the task.

## Reference guide routing

- [Architecture](docs/agent-guides/architecture.md): components, routes,
  features, naming, reuse, and code complexity. Read when changing code
  structure, components, hooks, or route organization.
- [State and API](docs/agent-guides/state-and-api.md): React state, server data,
  API calls, errors, and authentication. Read when changing data flow, state,
  API integration, or permissions.
- [UI and forms](docs/agent-guides/ui-and-forms.md): visual implementation,
  forms, keyboard behavior, accessibility, styling, and design assets. Read
  when changing the interface or interaction behavior.
- [Verification](docs/agent-guides/verification.md): tests, build checks, and
  final review. Read for implementation tasks before reporting completion.
- [Project operations](docs/agent-guides/project-operations.md): configuration,
  dependencies, documentation, and error recovery. Read when changing
  tooling, packages, environment configuration, or developer documentation.
- [Anti-patterns](.agents/patterns/anti-pattern.md): coding constraints and
  review checks. Read before coding or reviewing any feature or code change.

A task may require several guides. Read every guide relevant to the changed
behavior, including downstream effects discovered during implementation.
For example, a form that submits to an API requires the UI and forms, State
and API, and Verification guides. User instructions take precedence over this
file; this file takes precedence over the reference guides. Reference guides
do not grant permission to ignore other affected areas.

## Working sequence

1. Inspect the existing implementation and identify the affected features,
   files, user behavior, and verification steps.
2. Read the relevant guides from the routing table. Add another guide if the
   task crosses a boundary while you work.
3. Make the smallest safe change, preserving unrelated user changes.
4. Run the smallest relevant checks, then broader checks when the change
   requires them. Report any check that could not run and the remaining risk.
5. Review the result against the request and report changes, evidence, and
   limitations.

After completing a feature, run `pnpm lint` from the repository root. Fix all
ESLint errors and warnings before marking the feature done or ready for
production. Do not skip lint because another check passed.

Before coding, read `.agents/patterns/anti-pattern.md` and apply its guidance
to the implementation. During review, check the changed code against every
relevant anti-pattern and fix violations before reporting completion.

## Core Principles

- Follow the existing codebase before introducing new patterns.
- Keep changes small, direct, and easy to review.
- Prefer simple solutions over speculative abstractions.
- Implement only what is required by the current task.
- Reuse existing utilities, components, hooks, and API clients where possible.
- Write code comments and messages passed to `throw new Error(...)` in English.
  User-facing error messages shown in the UI should remain in Vietnamese.
- Do not perform Git commits, pushes, resets, or branch operations unless the
  user explicitly asks for them.

## Dangerous Operation Confirmation

Agents must ask for explicit confirmation before performing high-risk actions:

- deleting files or directories
- batch-moving or batch-rewriting files
- modifying system configuration or permissions
- changing package manager configuration
- updating major dependencies
- calling production APIs
- running database or destructive data operations
- running `git commit`, `git push`, or `git reset --hard`

Confirmation format:

```text
Dangerous operation detected.
Operation: <operation>
Scope: <affected files, services, or data>
Risk: <possible consequence>

Please confirm whether to continue.
```

## Security Rules

Never read, print, or request secret values.

Forbidden:

- Do not read `.env`, `.env.local`, `.env.production`, or equivalent secret files.
- Do not ask the user to paste credentials, tokens, cookies, or private keys.
- Do not include real secrets in examples, tests, logs, screenshots, or docs.
- Do not send sensitive data to external services.

Allowed:

- Read `.env.example`, `.env.template`, or documented public configuration.
- Use placeholders such as `<SECRET>`, `<TOKEN>`, or `***REDACTED***`.
- Reference environment variables by name only.

Frontend-specific rule:

- Treat all frontend environment variables as public because they are bundled
  into browser-delivered code.
- Do not store secrets in `VITE_*`, `NEXT_PUBLIC_*`, or other client-exposed
  variables.
- Frontend variables may contain public base URLs, feature flags, release
  channels, or analytics public keys only when those values are safe to expose.

## Repository Discovery

Before editing, inspect the existing implementation:

- package manager and scripts
- framework version and routing pattern
- component organization
- API client conventions
- state management
- styling approach
- test setup
- lint and formatting setup

Use fast repository search tools such as `rg` where available.

## Git Safety

- Do not commit unless explicitly requested.
- Do not push unless explicitly requested.
- Do not reset, checkout, or discard user changes unless explicitly requested.
- If the worktree has unrelated changes, leave them untouched.
- If user changes affect the task, work with them rather than reverting them.
