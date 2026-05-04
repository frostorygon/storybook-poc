# API Onboarding Guide

How to add a new backend endpoint to the mock layer so it works in Storybook and tests.

---

## What You Need from Backend

Before writing any code, get this from the backend team:

| Info | Example | Where it goes |
|------|---------|---------------|
| **URL pattern** | `GET /api/v1/accounts/:accountId` | `scenarios.js` URL constants |
| **HTTP method** | GET, POST, PUT, DELETE | `scenarios.js` handler type |
| **Success response body** | `{ accountId: '...', balance: 1234 }` | `api/{domain}/ok.js` |
| **Alternative states** | Different response for "frozen" account | `api/{domain}/frozen.js` |
| **Error codes + HTTP status** | `401 → SESSION_EXPIRED`, `504 → TIMEOUT` | `scenarios.js` error handlers |
| **Request body (if POST/PUT)** | `{ reason: 'lost' }` | Not mocked — but good to document |

> **Tip:** Ask the backend team for a sample `curl` response. Paste it directly into the fixture file.

---

## Step-by-Step: Adding `GET /api/v1/accounts/:accountId`

### Step 1 — Create the fixture data

Create one JS file per response scenario under `demo/mocks/api/`. The folder structure mirrors the API path.

```
demo/mocks/api/
└── accounts/
    ├── active.js       ← happy path
    └── frozen.js       ← alternative state
```

Each file exports a plain object matching the **exact API response shape**:

```javascript
// demo/mocks/api/accounts/active.js
export default {
  accountId: 'ACC-9876-5432',
  status: 'active',
  balance: 1523.47,
  currency: 'EUR',
  holder: 'Jan de Vries',
};
```

```javascript
// demo/mocks/api/accounts/frozen.js
export default {
  accountId: 'ACC-9876-5432',
  status: 'frozen',
  balance: 1523.47,
  currency: 'EUR',
  holder: 'Jan de Vries',
  frozenDate: '2025-04-10T14:30:00Z',
};
```

> **Rule:** These files are the contract with backend. When the API shape changes, update the fixture and all consumers break loudly.

---

### Step 2 — Register in `mocks.js`

Add the new endpoint to the lookup table. Each value is a **lazy-loading function** that returns a `Response`:

```javascript
// demo/mocks/mocks.js
export default {
  // ... existing entries ...

  '/api/v1/accounts/:accountId': {
    ok: () => import('./api/accounts/active.js').then(r => Response.json(r.default)),
    frozen: () => import('./api/accounts/frozen.js').then(r => Response.json(r.default)),
  },
};
```

**Why lazy?** Fixture files can be large (arrays of 50+ transaction objects). Lazy loading keeps Storybook startup fast — fixtures are only loaded when a story actually needs them.

---

### Step 3 — Create handlers in `scenarios.js`

Add the URL constant and create MSW handlers:

```javascript
// demo/mocks/scenarios.js
const ACCOUNT_URL = '/api/v1/accounts/:accountId';

// ── Add to defaults (happy path) ───────────────────────────────
export default {
  defaults: [
    // ... existing defaults ...
    http.get(ACCOUNT_URL, mocks[ACCOUNT_URL].ok),
  ],
};

// ── Individual handlers (for per-story overrides) ──────────────
export const getAccount = http.get(ACCOUNT_URL, mocks[ACCOUNT_URL].ok);
export const getAccountFrozen = http.get(ACCOUNT_URL, mocks[ACCOUNT_URL].frozen);
export const getAccountTimeout = http.get(ACCOUNT_URL, () => json({ errorCode: 'TIMEOUT' }, { status: 504 }));
export const getAccountSessionExpired = http.get(ACCOUNT_URL, () => json({ errorCode: 'SESSION_EXPIRED' }, { status: 401 }));

// ── Re-export for test assertions ──────────────────────────────
export { default as activeAccountResponse } from './api/accounts/active.js';
export { default as frozenAccountResponse } from './api/accounts/frozen.js';
```

---

### Step 4 — Use in stories

```javascript
// stories/screens/account/account.stories.js
import { getAccount, getAccountFrozen, getAccountTimeout } from '../../../demo/mocks/scenarios.js';

export const ActiveAccount = {
  parameters: { mocks: [getAccount] },
  render: () => { /* ... */ },
};

export const FrozenAccount = {
  parameters: { mocks: [getAccountFrozen] },
  render: () => { /* ... */ },
};

export const TimeoutError = {
  parameters: { mocks: [getAccountTimeout] },
  render: () => { /* ... */ },
};
```

### Step 5 — Use in tests

```javascript
// test/screens/account.test.js
import { activeAccountResponse } from '../demo/mocks/scenarios.js';

it('displays the account holder name', async () => {
  // Use the same fixture data for assertions
  expect(el.shadowRoot.textContent).toContain(activeAccountResponse.holder);
});
```

---

## The Three-Layer Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Stories / Tests                          │
│   import { getAccount, getAccountTimeout } from scenarios.js   │
└──────────────────────────────┬──────────────────────────────────┘
                               │ imports handlers
┌──────────────────────────────▼──────────────────────────────────┐
│                        scenarios.js                             │
│   "When should the API return what?"                           │
│                                                                 │
│   • defaults[] — happy path for all endpoints                  │
│   • Named exports — individual overrides for specific stories  │
│   • Error handlers — timeout, session expired, generic error   │
│   • Re-exports fixture data for test assertions                │
└──────────────────────────────┬──────────────────────────────────┘
                               │ reads from
┌──────────────────────────────▼──────────────────────────────────┐
│                          mocks.js                              │
│   "What data does each URL return?"                            │
│                                                                 │
│   • URL → { ok: () => import(...), frozen: () => import(...) } │
│   • Lazy loading — fixtures only loaded when needed            │
│   • Response.json() wrapping — turns raw data into HTTP resp   │
└──────────────────────────────┬──────────────────────────────────┘
                               │ lazy-imports from
┌──────────────────────────────▼──────────────────────────────────┐
│                       api/{domain}/*.js                         │
│   "What does the API actually return?"                         │
│                                                                 │
│   • Plain JS objects — copy-paste from backend curl responses  │
│   • One file per response scenario                             │
│   • This IS the API contract — backend reviews these in PRs    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Checklist

When onboarding a new API endpoint:

- [ ] **Got the API spec from backend** — URL, method, response shape, error codes
- [ ] **Created fixture files** — `demo/mocks/api/{domain}/{scenario}.js`
- [ ] **Registered in `mocks.js`** — lazy-loading entry with `Response.json()` wrapping
- [ ] **Added handlers in `scenarios.js`** — defaults + individual + error combos
- [ ] **Re-exported fixture data** — for test assertions
- [ ] **Used in stories** — `parameters: { mocks: [handler] }`
- [ ] **Used in tests** — imported response data for assertions
- [ ] **Backend reviewed fixture files** — confirms response shape matches real API

---

## Naming Quick Reference

| What | Pattern | Example |
|------|---------|---------|
| Fixture file | `api/{domain}/{state}.js` | `api/accounts/frozen.js` |
| Handler export | `{verb}{Resource}{Scenario}` | `getAccountFrozen` |
| Error handler | `{verb}{Resource}{ErrorType}` | `holdCardTimeout` |
| Response re-export | `{scenario}{Resource}Response` | `frozenAccountResponse` |
| URL constant | `{RESOURCE}_URL` | `ACCOUNT_URL` |
