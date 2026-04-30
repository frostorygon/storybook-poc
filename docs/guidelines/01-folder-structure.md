# Folder Structure & File Separation

Every component lives in its own directory. Tests, stories, docs, styles, and templates are colocated — not scattered across global folders. When you delete a component directory, nothing is left behind.

## Directory Layout

```
src/
├── components/              # Reusable, domain-agnostic UI
│   ├── layout/              # Structural atoms (grids, slots, no logic)
│   │   └── status-screen-layout/
│   └── screens/             # Configurable shells (error, success)
│       ├── status-error-screen/
│       └── status-success-screen/
├── screens/                 # Domain-specific "smart" components
│   ├── toggle/              # holdcard-toggle-screen
│   └── error/
│       └── session-expired/ # session-expired-error-screen
├── services/                # API clients, data normalization
│   ├── holdcard-service.js
│   └── auth-service.js
├── mocks/                   # Shared test fixtures
│   └── fixtures.js
├── docs/                    # Storybook MDX pages
├── feature-flow.js          # Root orchestrator
├── tokens.js                # Design tokens (CSS custom properties)
└── types.js                 # Shared JSDoc typedefs
```

### Why `components/` and `screens/` are separate

- **`components/`** contains pieces you could drop into any feature. They know nothing about holdcards, authentication, or banking. If you can imagine reusing it in a completely different product, it belongs here.
- **`screens/`** contains components that execute domain logic — redirecting to login, calling a specific API, making business decisions. They are tied to this feature.

### Why `services/` breaks colocation

Services are the one intentional exception to colocation. A service like `HoldcardService` is consumed by multiple orchestrators and screens. Colocating it inside one consumer would create a false ownership signal. See [07-services-and-data.md](./07-services-and-data.md) for the full rationale.

### Why `feature-flow.*` lives at root

The root orchestrator (`feature-flow.js`, `.stories.js`, `.styles.js`, `.test.js`) sits directly in `src/` rather than inside its own subdirectory. This is intentional — it's the entry point of the feature, equivalent to `App.js` in a React project. The 7-file directory standard applies to reusable *components*, not the root orchestrator. Moving it into a subdirectory would add indirection without value.

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
              │         (follows the full 7-file standard)
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

## The 7-File Standard

Every component directory contains up to 7 files. Each file has exactly one job:

| File | Purpose | Can you skip it? |
|------|---------|------------------|
| `index.js` | Public barrel export. Consumers import from here. | Never skip. |
| `[name].js` | The LitElement class. Properties, state, lifecycle, scoped elements. | Never skip. |
| `[name].template.js` | Pure function: `template(host) → html`. No logic beyond interpolation. | Never skip. |
| `[name].styles.js` | Exports `css` tagged template. May import shared tokens. | Never skip. |
| `[name].test.js` | Vitest tests: rendering, state, events. | Skip only for pure layout atoms with zero logic (e.g., a grid wrapper). |
| `[name].stories.js` | Storybook story variants and controls. | Skip only for internal-only components never shown in the catalog. |
| `[name].mdx` | Storybook docs page: usage guidance, API surface, edge cases. | Skip only for trivial atoms documented inline in stories. |

### When to skip files

A pure layout atom like `status-screen-layout` that has no properties, no events, and no conditional rendering can reasonably skip `.test.js` — there is nothing to assert beyond "it renders." Use judgment, not dogma.

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
