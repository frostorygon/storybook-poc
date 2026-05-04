# Architecture Guide

This document explains the project's structure, conventions, and mock architecture.
It serves as the reference for onboarding developers and answering "why is it structured this way?"

---

## Folder Structure

```
storybook-poc/
├── .storybook/            Storybook configuration
├── demo/
│   └── mocks/
│       ├── api/           Response payloads (one file per endpoint+scenario)
│       ├── mocks.js       Registry mapping endpoints → response data
│       └── scenarios.js   @web/mocks handlers — single source of truth
├── src/                   Component source code (ships to production)
│   ├── components/
│   ├── screens/
│   ├── services/
│   └── feature-flow.js
├── stories/               Storybook stories + docs (MDX)
├── test/                  Automated tests
│   ├── screens/
│   ├── services/
│   └── feature-flow.test.js
├── vitest.config.js
└── package.json
```

### Why separate folders?

| Folder | Purpose | Ships to prod? |
|--------|---------|----------------|
| `src/` | Component source code — what gets bundled and deployed | ✅ Yes |
| `demo/mocks/` | API mock data + handlers — simulates the backend | ❌ No |
| `stories/` | Storybook stories — visual documentation of component behavior | ❌ No |
| `test/` | Automated tests — verification that components work correctly | ❌ No |
| `.storybook/` | Storybook configuration | ❌ No |

**Key principle:** `src/` contains only shippable code. Build tooling (rollup) points at
`src/` and never has to filter out `*.test.js` or `*.stories.js`. This follows both the
[open-wc](https://open-wc.org/) recommendations and the org template convention
(`P20594-ING-FEAT-EXAMPLE`).

---

## Buildless Development

This project follows the **open-wc buildless philosophy**: during development, code runs
directly in the browser using native ES modules — no Webpack, no Vite bundler, no
transpilation step. The `@web/storybook-builder` serves files via `@web/dev-server`,
which uses esbuild only for on-demand transforms (e.g., TypeScript, decorators), not
full bundling.

**Why this matters:**
- Faster dev startup (no build step)
- What you write = what the browser runs
- Debugging uses actual source files, not sourcemaps into bundled output
- Aligns with the `@web/` ecosystem (`@web/dev-server`, `@web/test-runner`)

---

## Mock Architecture — "One Mock, Two Consumers"

The core thesis: **define API mocks once, use them in both Storybook and tests.**

```
demo/mocks/
├── api/cards/          ← Raw JSON payloads (one file per scenario)
├── mocks.js            ← Registry mapping endpoint paths → named scenarios
└── scenarios.js        ← @web/mocks handlers assembled from registry
         ↓                          ↓
    stories/ imports           test/ imports
    (Storybook)                (Vitest / @web/test-runner)
```

1. **Response data** lives in `demo/mocks/api/` — plain JS objects
2. **`mocks.js`** maps endpoint URLs to named scenarios
3. **`scenarios.js`** creates `@web/mocks` handlers and re-exports both handlers and raw data
4. **Stories** import handlers: `import { getCard } from '../demo/mocks/scenarios.js'`
5. **Tests** import the same file: `import { holdSuccessResponse } from '../demo/mocks/scenarios.js'`

For naming conventions, handler patterns, and step-by-step instructions for adding new endpoints, see [08-services-mocking-data.md](./docs/guidelines/08-services-mocking-data.md).

---

## Storybook Mocks Panel

The `@web/storybook-addon-mocks` reads `parameters.mocks` from each story and provides
a "Mocks" panel in the Storybook UI. Developers can:

- **See** which endpoints are mocked for each story
- **Edit** response bodies and status codes live
- **Override** mocks without changing code

```js
export const HoldCard = {
  parameters: {
    mocks: [getCard, holdCard],  // ← addon reads this
  },
  render: () => html`<feature-flow ...></feature-flow>`,
};
```

---

## Tooling Alignment

| Tool | This POC | Org Standard | Notes |
|------|----------|--------------|-------|
| Storybook | `^9.1.20` | `^9.1.20` | ✅ Aligned |
| Builder | `@web/storybook-builder ^0.3.0` | Same | ✅ Aligned |
| Mocking | `@web/mocks ^2.0.0` | Same | ✅ Aligned |
| Mock Panel | `@web/storybook-addon-mocks ^1.0.0` | Same | ✅ Aligned |
| Test Runner | Vitest (browser mode) | `@web/test-runner` | ⚠️ See below |
| Test Utils | `storybook/test` | `@open-wc/testing` | ⚠️ See below |

### Test Runner Migration Path

This POC uses **Vitest** (browser mode, running in real Chromium via Playwright) to
demonstrate that the mock architecture is **test-runner agnostic**. The same
`demo/mocks/scenarios.js` works with any runner.

Production repos should use `@web/test-runner` + `@open-wc/testing` per org standard.
Migration steps:

1. Replace `vitest` with `@web/test-runner` in `devDependencies`
2. Replace `vitest.config.js` with `web-test-runner.config.mjs`
3. Replace `import { describe, it, expect } from 'vitest'` with `import { fixture, expect, html } from '@open-wc/testing'`
4. **Mock imports stay identical** — no changes to `demo/mocks/`

---

## Adding a New API Endpoint

1. **Create response file:** `demo/mocks/api/{domain}/{scenario}.js`
   ```js
   export default { transactionId: 'TX-001', status: 'completed' };
   ```

2. **Register in `demo/mocks/mocks.js`:**
   ```js
   import txOk from './api/transactions/ok.js';
   // Add to the default export:
   '/api/v1/transactions/:txId': { ok: txOk },
   ```

3. **Add handler in `demo/mocks/scenarios.js`:**
   ```js
   export const getTransaction = http.get('/api/v1/transactions/:txId', () => json(mocks['/api/v1/transactions/:txId'].ok));
   ```

4. **Use in story:**
   ```js
   parameters: { mocks: [getTransaction] }
   ```

5. **Use in test:**
   ```js
   import { getTransaction } from '../demo/mocks/scenarios.js';
   ```

---

## Open-WC Alignment

This project is built on [open-wc](https://open-wc.org/) recommendations. The following tracks what we follow and what we consciously trade off.

### What We Follow

| Principle | How |
|-----------|-----|
| **Buildless development** | `@web/storybook-builder` runs `@web/dev-server` — no Webpack/Vite bundling during dev |
| **Lit as base library** | All components extend `LitElement` |
| **Scoped custom element registry** | `@open-wc/scoped-elements` — no global `customElements.define()` collisions |
| **Side-effects over stubs** | Tests verify DOM output and fired events, not internal method calls |
| **`demo/` folder convention** | Extended with `demo/mocks/` for the centralized mock layer |

### Conscious Trade-offs

| Area | This project | Open-WC standard | Why |
|------|-------------|------------------|-----|
| Test runner | Vitest (browser mode) | `@web/test-runner` | Proves mock architecture is runner-agnostic. See Tooling Alignment above for migration steps. |
| Assertions | Vitest `expect` | `@open-wc/testing` (Chai) | Same reason — familiarity + speed for the POC |
| Fixture helper | Manual `mount()` | `fixture()` from `@open-wc/testing` | `fixture()` auto-cleans and awaits `updateComplete` — recommended for production |
| Semantic DOM diff | Not used | `@open-wc/semantic-dom-diff` | Add when migrating to `@web/test-runner` |
| a11y assertions | Storybook addon only | `chai-a11y-axe` in tests | Add when migrating to `@web/test-runner` |
| ESLint | Not configured | `eslint-plugin-lit-a11y` | Org has `eslint-config-ow` — include in production repos |

### Key Links

| Topic | Link |
|-------|------|
| Getting Started | [open-wc.org/guides/.../getting-started](https://open-wc.org/guides/developing-components/getting-started/) |
| Going Buildless | [open-wc.org/guides/.../going-buildless](https://open-wc.org/guides/developing-components/going-buildless/) |
| Testing Guide | [open-wc.org/guides/.../testing](https://open-wc.org/guides/developing-components/testing/) |
| Scoped Elements | [open-wc.org/docs/.../scoped-elements](https://open-wc.org/docs/development/scoped-elements/) |
| Modern Web | [modern-web.dev](https://modern-web.dev/) |
