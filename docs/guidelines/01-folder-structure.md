# Folder Structure & File Separation

Every component lives in its own directory. Styles and templates are colocated — tests and stories live in parallel root directories that mirror the `src/` structure. When you delete a component directory and its corresponding test/story paths, nothing is left behind.

## Project Layout

```
storybook-poc/
├── .storybook/              Storybook configuration
├── demo/
│   └── mocks/               API mock layer (shared by stories + tests)
│       ├── api/             Response payloads (one file per endpoint+scenario)
│       ├── mocks.js         Registry: endpoint paths → named scenarios
│       └── scenarios.js     @web/mocks handlers — single source of truth
├── docs/
│   └── guidelines/          This documentation suite
├── src/                     Component source code (ships to production)
│   ├── components/          Reusable, domain-agnostic UI
│   │   ├── layout/          Structural atoms (grids, slots, no logic)
│   │   │   └── status-screen-layout/
│   │   └── screens/         Configurable shells (error, success)
│   │       ├── status-error-screen/
│   │       └── status-success-screen/
│   ├── screens/             Domain-specific "smart" components
│   │   ├── toggle/          holdcard-toggle-screen
│   │   ├── error/
│   │   │   ├── generic/     generic-error-screen
│   │   │   ├── timeout/     timeout-error-screen
│   │   │   └── session-expired/
│   │   └── success/
│   │       ├── held/        hold-success-screen
│   │       └── unheld/      unhold-success-screen
│   ├── services/            API clients, data normalization
│   │   ├── holdcard-service.js
│   │   └── auth-service.js
│   ├── feature-flow.js      Root orchestrator (entry point)
│   ├── feature-flow.styles.js
│   ├── tokens.js            Design tokens (CSS custom properties)
│   ├── types.js             Shared JSDoc typedefs
│   └── declarations.d.ts    Custom element type declarations (IDE support)
├── stories/                 Storybook stories + MDX docs
│   ├── screens/
│   │   └── toggle/
│   ├── feature-flow.stories.js
│   ├── introduction.mdx
│   ├── overview.mdx
│   └── api-fixtures.mdx
├── test/                    Automated tests (mirrors src/ structure)
│   ├── screens/
│   │   ├── toggle/
│   │   └── error/session-expired/
│   ├── services/
│   └── feature-flow.test.js
├── vitest.config.js
└── package.json
```

### Why `src/`, `test/`, `stories/`, and `demo/` are separate

| Folder | Purpose | Ships to prod? |
|--------|---------|----------------|
| `src/` | Component source code — what gets bundled and deployed | ✅ Yes |
| `demo/mocks/` | API mock data + handlers — simulates the backend | ❌ No |
| `stories/` | Storybook stories + MDX docs — visual documentation | ❌ No |
| `test/` | Automated tests — verification that components work correctly | ❌ No |

**Key principle:** `src/` contains only shippable code. Build tooling (rollup) points at `src/` and never has to filter out `*.test.js` or `*.stories.js`. This follows the [open-wc](https://open-wc.org/) recommendations and the org template convention.

### Categorizing shared components (`src/components/`)

When you promote a component to the shared `components/` directory, **do not dump it at the root**. Group it by category so the folder stays navigable as the project scales.

- `layout/` — Structural atoms (grids, layout containers)
- `screens/` — Configurable shells (error screen, success screen)
- `ui/` (or `elements/`) — General interactive elements (buttons, modals, badges, tooltips)
- `forms/` — Input fields, dropdowns, checkboxes

### Why `components/` and `screens/` are separate

- **`components/`** contains pieces you could drop into any feature. They know nothing about holdcards, authentication, or banking. If you can imagine reusing it in a completely different product, it belongs here.
- **`screens/`** contains components that execute domain logic — redirecting to login, calling a specific API, making business decisions. They are tied to this feature.

### Why `services/` breaks colocation

Services are the one intentional exception to colocation. A service like `HoldcardService` is consumed by multiple orchestrators and screens. Colocating it inside one consumer would create a false ownership signal. See [08-services-mocking-data.md](./08-services-mocking-data.md) for the full rationale.

### Why `feature-flow.*` lives at `src/` root

The root orchestrator (`feature-flow.js` + `feature-flow.styles.js`) sits directly in `src/` rather than inside its own subdirectory. This is intentional — it's the entry point of the feature, equivalent to `App.js` in a React project. Its corresponding story lives at `stories/feature-flow.stories.js` and its test at `test/feature-flow.test.js`. The component file standard (below) applies to reusable *components*, not the root orchestrator.

---

## Where Custom Components Live

Not everything needs to be a shared component. Use this decision framework:

### The 3-Placement Rule

| Placement | When to use | Example |
|-----------|-------------|---------|
| **Inline in the template** | < ~20 lines, no independent state, no reuse potential | A styled badge `<span>`, a conditional `<p>` block |
| **Colocated subdirectory** | Only ONE screen uses it, but it's complex enough to warrant its own class/template/styles | A `card-preview/` widget inside `screens/toggle/` |
| **`src/components/`** | 2+ screens use it, OR it's domain-agnostic enough for a different feature | A modal, a spinner, a notification toast |

### Decision Flowchart

```
Is it more than ~20 lines of template + styles?
  │
  ├── NO → Keep it inline in the template function.
  │
  └── YES → Does more than one screen/flow use it?
              │
              ├── YES → Extract to src/components/
              │         (follows the component file standard)
              │
              └── NO → Colocate inside the screen's directory:
                        screens/toggle/card-preview/
                        ├── index.js
                        ├── card-preview.js
                        ├── card-preview.template.js
                        └── card-preview.styles.js
```

### The Promotion Rule

**Start colocated, promote when needed.** When a second consumer appears, move the component to `src/components/`. Never preemptively move something to `src/components/` because it "might" be reused someday — that creates premature abstraction and clutters the shared directory.

### Anti-pattern — The "Shared Graveyard"

```
src/components/
├── card-preview/          ← only used by toggle screen
├── error-badge/           ← only used by error screen
├── hold-confirmation/     ← only used by feature-flow
└── status-screen-layout/  ← actually shared ✅
```

If most items in `src/components/` have exactly one consumer, the directory has become a dumping ground. Move single-consumer components back to their screen directories.

---

## The Component File Standard

Every component directory in `src/` contains the following files. Each file has exactly one job:

| File | Purpose | Can you skip it? |
|------|---------|------------------|
| `index.js` | Public barrel export. Consumers import from here. | Never skip. |
| `[name].js` | The LitElement class. Properties, state, lifecycle, scoped elements. **No `customElements.define()`.** | Never skip. |
| `[name].template.js` | Pure function: `template({ prop1, prop2 }) → html`. See [03-template-patterns.md](./03-template-patterns.md). | Never skip. |
| `[name].styles.js` | Exports `css` tagged template. May import shared tokens. | Never skip. |

Tests and stories live in **separate root directories** that mirror the `src/` structure:

| File | Location | Can you skip it? |
|------|----------|------------------|
| `[name].test.js` | `test/` (mirrors `src/` path) | Skip only for pure layout atoms with zero logic. |
| `[name].stories.js` | `stories/` (mirrors `src/` path) | Skip only for internal-only components. |
| `[name].mdx` | `stories/` (alongside the story) | Skip only for trivial atoms. |

### Registration

Components do **not** register themselves. `ScopedElementsMixin` in the parent handles scoped registration. Stories and tests that render a component standalone call `customElements.define()` at the top of the file — that's the story/test's responsibility, not the component's.

The only exception is the **root orchestrator** (`feature-flow.js`) which calls `customElements.define()` at the bottom because it's the entry point the webview shell loads.

### Mock data

API fixtures live in `demo/mocks/api/` — they represent feature-level data states, not component-level concerns. A generic reusable component like `status-error-screen` should not own error code fixtures; those belong to the feature flow that maps domain data to component props. See [08-services-mocking-data.md](./08-services-mocking-data.md) for the full mock architecture.

### When to skip files

A pure layout atom like `status-screen-layout` that has no properties, no events, and no conditional rendering can reasonably skip tests — there is nothing to assert beyond "it renders." Use judgment, not dogma.

**Don't skip files for:** Any component with properties, events, conditional rendering, or domain logic. If you're unsure, write the test — you'll thank yourself during the next refactor.

---

## Naming Conventions

| Thing | Convention | Example |
|-------|-----------|---------|
| Directories | `kebab-case` | `status-error-screen/` |
| Files | Component tag name | `status-error-screen.js` |
| Classes | `PascalCase` | `StatusErrorScreen` |
| Custom element tags | `kebab-case` (min. one hyphen, per spec) | `<status-error-screen>` |
| Domain grouping | Nest under a domain folder | `screens/error/session-expired/` |
