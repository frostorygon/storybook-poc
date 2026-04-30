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
├── mocks/              # Shared test/story fixtures
├── docs/               # Storybook MDX documentation pages
├── feature-flow.js     # Root orchestrator (entry point)
├── tokens.js           # Design tokens (CSS custom properties)
└── types.js            # Shared JSDoc typedefs
```

See `docs/guidelines/` for the full documentation suite (9 guidelines).

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
| 03 | State & Variables | Props, state, events, naming conventions |
| 04 | Styling | Tokens, Shadow DOM, `:host`, `::part()` |
| 05 | Storybook | Audiences, story patterns, mock service injection |
| 06 | Testing | Vitest + Playwright, mount helper, service tests |
| 07 | Services & Data | DI, error normalization, bounded contexts |
| 08 | Accessibility | ARIA, focus management, color contrast |
| 09 | Internationalization | `LocalizeMixin`, namespaces, translation files |

## References

- [VS Code Webview UI Toolkit Storybook](https://microsoft.github.io/vscode-webview-ui-toolkit/?path=/story/library-badge--default)
- [JetBrains Ring UI Storybook](https://jetbrains.github.io/ring-ui/develop-8.0/index.html?path=/story/utilities-caret--basic)
- [Grafana UI Storybook](https://developers.grafana.com/ui/latest/index.html?path=/docs/navigation-toolbarbuttonrow--docs)
