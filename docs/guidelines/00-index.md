# Guidelines Index

Internal coding standards for Lit/Lion web component features. Start here, then follow the links.

For project-level architecture decisions (folder rationale, mock architecture, buildless philosophy, tooling alignment, open-wc trade-offs), see [ARCHITECTURE.md](../../ARCHITECTURE.md).

---

| # | Guideline | Summary |
|---|-----------|---------|
| 01 | [Folder Structure](./01-folder-structure.md) | Project layout, component file standard, naming conventions, colocation rules |
| 02 | [Component Architecture](./02-component-architecture.md) | 3-layer model (Layout → Shell → Smart), variant-driven screens, thin router |
| 03 | [Template Patterns](./03-template-patterns.md) | Extracted `template(props)` functions, event handler forwarding, anti-patterns |
| 04 | [State & Variables](./04-state-and-variables.md) | Public properties, internal state (`_` prefix), CustomEvent conventions |
| 05 | [Styling](./05-styling.md) | Design tokens, Shadow DOM, `:host` patterns, `::part()` escape hatch |
| 06 | [Storybook Standards](./06-storybook-standards.md) | Audiences, CSF3 templates, Controls/Actions/Interactions, Shadow DOM gotchas |
| 07 | [Testing Standards](./07-testing-standards.md) | Vitest browser mode, `mount()` helper, component/service/orchestrator tests |
| 08 | [Services, Mocking & Data](./08-services-mocking-data.md) | DI, error normalization, `@web/mocks` architecture, naming conventions |
| 09 | [Accessibility & i18n](./09-accessibility-and-i18n.md) | WCAG AA, focus management, Lion `LocalizeMixin`, translation patterns |
| 10 | [API Onboarding](./10-api-onboarding.md) | Step-by-step guide for adding new backend endpoints to the mock layer |
