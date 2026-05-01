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
│   ├── active.js           GET /api/v1/cards/:cardId (active card)
│   ├── on-hold.js          GET /api/v1/cards/:cardId (held card)
│   ├── hold/ok.js          POST /api/v1/cards/:cardId/hold (success)
│   └── unhold/ok.js        POST /api/v1/cards/:cardId/unhold (success)
├── mocks.js            ← Registry mapping endpoint paths → named scenarios
└── scenarios.js        ← @web/mocks handlers assembled from registry
         ↓                          ↓
    stories/ imports           test/ imports
    (Storybook)                (Vitest / @web/test-runner)
```

### How it works

1. **Response data** is defined in `demo/mocks/api/` files — plain JS objects
2. **`mocks.js`** maps endpoint URLs to named scenarios (ok, onHold, etc.)
3. **`scenarios.js`** uses `@web/mocks/http.js` to create handler objects and re-exports
   both handlers (for `parameters.mocks`) and raw response data (for test assertions)
4. **Stories** import handlers: `import { getCard, holdCard } from '../demo/mocks/scenarios.js'`
5. **Tests** import the same file: `import { holdSuccessResponse } from '../demo/mocks/scenarios.js'`

### Error scenarios

Error responses (500, 401, 504) are defined inline in `scenarios.js` because they're
trivial one-liners. Success response data is separated into `api/` files because tests
need to assert against the exact payloads.

### Naming Conventions

#### Handler exports (in `scenarios.js`)

Pattern: **`{method}{Resource}{Scenario}`** — camelCase, verb-first.

| Export | Method | Resource | Scenario |
|--------|--------|----------|----------|
| `getCard` | get | Card | *(happy path — no suffix)* |
| `getCardOnHold` | get | Card | OnHold |
| `holdCard` | hold (POST) | Card | *(happy path)* |
| `holdCardGenericError` | hold (POST) | Card | GenericError |
| `holdCardTimeout` | hold (POST) | Card | Timeout |
| `holdCardSessionExpired` | hold (POST) | Card | SessionExpired |

**Rules:**
- Happy-path handlers omit the scenario suffix: `getCard`, not `getCardOk`
- Error handlers append the error type: `holdCardTimeout`
- The method prefix matches the business action, not always the HTTP verb (`holdCard` = POST)

#### Response data exports (in `scenarios.js`)

Pattern: **`{scenario}{Resource}Response`** — camelCase, noun-ending.

| Export | Scenario | Resource |
|--------|----------|----------|
| `activeCardResponse` | active | Card |
| `onHoldCardResponse` | onHold | Card |
| `holdSuccessResponse` | holdSuccess | *(implied)* |
| `unholdSuccessResponse` | unholdSuccess | *(implied)* |

#### API response files (in `demo/mocks/api/`)

Pattern: **`{domain}/{scenario}.js`** — kebab-case, one file per scenario.

```
api/
└── cards/
    ├── active.js        ← default/happy state
    ├── on-hold.js       ← alternative state
    ├── hold/ok.js       ← action success
    └── unhold/ok.js     ← action success
```

**Rules:**
- Use `ok.js` for success responses to action endpoints (POST/PUT/DELETE)
- Use descriptive state names for GET responses (`active.js`, `on-hold.js`)
- Group by resource domain (`cards/`), then by action (`hold/`, `unhold/`)

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
