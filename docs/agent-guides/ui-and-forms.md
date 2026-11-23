# Ui And Forms

## Forms And Keyboard Behavior

- Forms should support Enter-to-submit when the focused field belongs to the
  main submit flow.
- Prefer native form semantics and the component library's submit mechanism.
- If a custom input, modal, or wizard footer intercepts keyboard events, wire
  Enter explicitly to the same validated submit path used by the primary button.
- Preserve validation, disabled, and loading guards for keyboard submission.
- Keep validation rules centralized for each form. Do not duplicate the same
  required, pattern, length, or business rule across blur handlers, submit
  handlers, and button click handlers.
- Keep create and edit forms explicit about initial values, dirty state, reset
  behavior, and submit payload mapping.
- Keep field error messages close to the validation rule or form schema so the
  user-facing behavior has one source of truth.

## UI Implementation

- Match the existing design system, spacing scale, typography, and interaction
  patterns.
- Use the existing icon system before adding a new icon dependency.
- Use existing UI components before building new controls. Do not recreate
  forms, tables, dialogs, dropdowns, uploaders, notifications, pagination, or
  navigation primitives when the project or UI library already provides them.
- Do not add feature-local wrapper components that only forward basic props to
  a library component, such as a `SubmitButton` that passes through `label` and
  `loading`. Use the library component directly. Create a separate component
  file when it adds meaningful custom behavior, composition, or styling that
  the existing API cannot express clearly. See
  [the anti-pattern guide](../../.agents/patterns/anti-pattern.md).
- Use standard controls for standard interactions: buttons, menus, tabs, forms,
  switches, segmented controls, sliders, and dialogs.
- Do not create a marketing landing page when the requested output is an app,
  dashboard, tool, or workflow screen.
- Keep layouts responsive across mobile and desktop.
- Ensure text does not overflow, overlap, or become unreadable.
- Avoid decorative visuals that do not support the product experience.
- Do not nest cards inside cards unless the existing design system requires it.
- For dashboard, SaaS, CRM, or workflow products, prefer dense, scannable, and
  predictable layouts over decorative marketing-style sections.
- Use stable dimensions for fixed-format UI such as toolbars, icon buttons,
  counters, boards, grids, and stat cards so hover, loading, and dynamic text do
  not shift layout.

## Accessibility

- Use semantic elements before adding ARIA attributes.
- Use buttons for actions and links for navigation.
- Keep keyboard navigation, visible focus states, and logical tab order intact.
- Ensure form controls have labels, validation messages, and accessible error
  states.
- Keep dialogs, drawers, popovers, and menus compatible with keyboard and screen
  reader expectations.
- Use `alt=""` for decorative images and meaningful `alt` text for content
  images.
- Do not remove accessible names from icon-only controls.

## Styling

- Follow the existing styling approach: CSS Modules, SCSS Modules, Tailwind,
  CSS-in-JS, or component-library styling.
- Prefer local component styles over broad global overrides.
- Keep class names semantic and scoped.
- Avoid hardcoded one-off colors when design tokens or theme variables exist.
- Use stable dimensions for fixed-format UI elements such as toolbars, icon
  buttons, grids, boards, counters, and tiles.

## Assets And Figma

- Use real exported assets when implementing from design files.
- Inspect the exact Figma frame, component, or icon node before coding. Prefer a
  narrow node request over loading an entire page.
- Match provided desktop frame alignment, spacing, typography, colors, borders,
  radii, and shadows precisely when the design gives those values.
- Download or import the smallest meaningful asset node.
- Inspect SVG assets before use.
- Reject exports containing invalid path data, unexpected text, oversized frames,
  or missing dimensions.
- Use `alt=""` and `aria-hidden="true"` for decorative images.
- Do not redraw complex icons in CSS when a valid asset exists.
- When using component libraries inside a Figma-restored screen, account for
  library default padding, line height, and internal DOM. Prefer scoped
  component-local overrides over global library selectors.
- Verify at the target desktop width and at least one narrow width before
  finishing UI-heavy work.
