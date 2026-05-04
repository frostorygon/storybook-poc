# Storybook POC — Temporary Holdcard

A proof-of-concept demonstrating how to build a standalone webview feature using [Lit](https://lit.dev/), [Lion Web Components](https://lion-web.netlify.app/), and [Storybook](https://storybook.js.org/).

## Live Demo

👉 **[View Storybook](https://frostorygon.github.io/storybook-poc/)**

## What This Proves

This POC validates a scalable architecture for banking webview features:

- **3-Layer Composition** — Layout → Shell → Smart Component (see `docs/guidelines/02-component-architecture.md`)
- **Extracted Templates** — Pure `template(host)` functions, no logic in the render path
- **Dependency Injection** — Services injected as properties, same mock pattern for tests and stories
- **Fixture-Driven Variants** — Text-only differences handled by data fixtures, not new component files
- **Scoped Element Registry** — No global `customElements.define()` collisions

## Architecture

```
src/
├── components/         # Reusable, domain-agnostic (layout, shells)
├── screens/            # Domain-specific smart components
├── services/           # API clients with error normalization
├── feature-flow.js     # Root orchestrator (entry point)
├── tokens.js           # Design tokens (CSS custom properties)
└── types.js            # Shared JSDoc typedefs
```

See `docs/guidelines/` for the full documentation suite (12 guidelines).

## Getting Started

```bash
pnpm install
pnpm storybook          # dev server on localhost:6006
pnpm test               # vitest (22+ tests, Playwright browser mode)
pnpm build-storybook    # static build → storybook-static/
```

## Guidelines

| # | Guideline | Summary |
|---|-----------|---------|
| 01 | Folder Structure | 7-file standard, colocation, naming |
| 02 | Component Architecture | 3-layer model, Fixture vs Smart Component |
| 03 | Template Patterns | Extracted `template(props)`, pure functions, no `this` |
| 04 | State & Variables | Props, state, events, naming conventions |
| 05 | Styling | Tokens, Shadow DOM, `:host`, `::part()` |
| 06 | Storybook Standards | Audiences, story patterns, mock service injection |
| 07 | Testing Standards | Vitest + Playwright, mount helper, service tests |
| 08 | Services & Data | DI, error normalization, bounded contexts |
| 09 | Accessibility | ARIA, focus management, color contrast |
| 10 | Internationalization | `LocalizeMixin`, namespaces, translation files |
| 11 | Mocking Strategy | MSW v2, one file per API domain, handler naming |
| 12 | Open-WC Alignment | What we follow, conscious trade-offs, migration path |

## References

- [VS Code Webview UI Toolkit Storybook](https://microsoft.github.io/vscode-webview-ui-toolkit/?path=/story/library-badge--default)
- [JetBrains Ring UI Storybook](https://jetbrains.github.io/ring-ui/develop-8.0/index.html?path=/story/utilities-caret--basic)
- [Grafana UI Storybook](https://developers.grafana.com/ui/latest/index.html?path=/docs/navigation-toolbarbuttonrow--docs)
