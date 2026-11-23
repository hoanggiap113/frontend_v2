# State and API

## State Ownership

- Keep local UI state such as open/closed, hover, selected row, and temporary
  input state inside the smallest relevant component.
- Keep shareable navigation state such as filters, pagination, sorting, and tabs
  in URL/search params when users need refresh, back/forward, or shareable links.
- Keep server state in the project's data-fetching layer or cache. Do not copy
  server data into global stores without a clear ownership and invalidation
  strategy.
- Use global stores only for cross-page client state, application session state,
  or state that genuinely has multiple distant consumers.
- Persist only intentional user preferences, drafts, or session-safe values.
  Never persist secrets.
- Do not store derived state when it can be computed from props, URL params,
  server data, or store state cheaply and reliably.

## React Guidelines

- Prefer function components and hooks.
- Keep components small enough to understand without excessive indirection.
- Do not introduce global state for local UI state.
- Memoize only when there is a measurable or obvious rendering concern.
- Keep side effects inside dedicated hooks or clearly scoped `useEffect` blocks.
- Preserve the repository's TanStack Router file-based routing pattern.
- Do not mix route normalization, polling, API hydration, modal state, and
  derived UI state in one effect.

## API And Error Handling

- Use the existing API client instead of creating ad hoc `fetch` or `axios`
  calls.
- Keep endpoint definitions and request/response types close to the API layer.
- Prefer backend-provided error messages when the project standard allows it.
- Avoid duplicate error notifications from both interceptors and business code.
- Handle authentication failures in the existing global auth flow.
- Keep local validation errors separate from API failure handling.
- Surface API request failures once from the business catch path or the
  project's chosen error utility. Do not add duplicate non-auth toasts in global
  interceptors when feature code also handles the error.
- Prefer backend-provided `message` values when they are safe for users; use a
  frontend fallback when the backend does not provide a message.
