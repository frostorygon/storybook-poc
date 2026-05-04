# API Onboarding Guide

How to add a new backend endpoint to the mock layer so it works in Storybook and tests.

---

## What You Need from Backend

Before writing any code, get this from the backend team:

| Info | Example | Where it goes |
|------|---------|---------------|
| **URL pattern** | `GET /api/v1/accounts/:accountId` | `mocks.js` URL key |
| **HTTP method** | GET, POST, PUT, DELETE | `scenarios.js` handler type |
| **Success response body** | `{ accountId: '...', balance: 1234 }` | `api/{domain}/ok.js` |
| **Alternative states** | Different response for "frozen" account | `api/{domain}/frozen.js` |
| **Error codes + HTTP status** | `401 → SESSION_EXPIRED`, `504 → TIMEOUT` | `scenarios.js` error bundles |
| **Request body (if POST/PUT)** | `{ reason: 'lost' }` | Not mocked — but good to document |

> **Tip:** Ask the backend team for a sample `curl` response. Paste it directly into the fixture file.

---

## Step-by-Step: Adding `GET /api/v1/accounts/:accountId`

### Step 1 — Create the fixture data (`api/`)

Create one JS file per response scenario. The folder structure mirrors the API path.

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

### Step 2 — Register in `mocks.js` (the logic layer)

Add lazy-loading entries that import the fixtures and wrap them in `Response.json()`:

```javascript
// demo/mocks/mocks.js
export default {
  // ... existing entries ...

  '/api/v1/accounts/:accountId': {
    ok:     () => import('./api/accounts/active.js').then(r => Response.json(r.default)),
    frozen: () => import('./api/accounts/frozen.js').then(r => Response.json(r.default)),
  },
};
```

**Why lazy?** Fixture files can be large (arrays of 50+ objects). `import()` ensures they're only loaded when a story actually needs them, keeping Storybook startup fast.

---

### Step 3 — Create scenario bundles in `scenarios.js`

Add the new endpoint to existing bundles and create new scenario bundles as needed:

```javascript
// demo/mocks/scenarios.js
const ACCOUNT_URL = '/api/v1/accounts/:accountId';

export default {
  // Happy path — add the new endpoint alongside existing ones
  default: [
    // ... existing handlers ...
    http.get(ACCOUNT_URL, mocks[ACCOUNT_URL].ok),
  ],

  // Frozen account — the account is frozen, everything else is normal
  frozenAccount: [
    // ... existing handlers from default ...
    http.get(ACCOUNT_URL, mocks[ACCOUNT_URL].frozen),
  ],

  // Account fetch fails — server timeout
  accountTimeout: [
    // ... existing handlers from default ...
    http.get(ACCOUNT_URL, () => json({ errorCode: 'TIMEOUT' }, { status: 504 })),
  ],
};

// Re-export fixture data for test assertions
export { default as activeAccountResponse } from './api/accounts/active.js';
export { default as frozenAccountResponse } from './api/accounts/frozen.js';
```

**Key idea:** Each scenario is a **bundle** — "what should the entire API look like?" Stories pick a whole scenario, not individual handlers.

---

### Step 4 — Use in stories

```javascript
import scenarios from '../../../demo/mocks/scenarios.js';

// "Show me the happy path"
export const ActiveAccount = {
  parameters: { mocks: scenarios.default },
};

// "Show me the frozen account"
export const FrozenAccount = {
  parameters: { mocks: scenarios.frozenAccount },
};

// "Show me a timeout error"
export const Timeout = {
  parameters: { mocks: scenarios.accountTimeout },
};
```

### Step 5 — Use in tests

```javascript
import { activeAccountResponse } from '../demo/mocks/scenarios.js';

it('displays the account holder name', async () => {
  // Use the same fixture data for assertions
  expect(el.shadowRoot.textContent).toContain(activeAccountResponse.holder);
});
```

---

## The Three Layers — Summary

| Layer | File | Responsibility | Changes when... |
|-------|------|---------------|-----------------|
| **Fixture data** | `api/{domain}/*.js` | Hardcoded response objects — what the backend returns | API response shape changes |
| **Mock registry** | `mocks.js` | Lazy-loads fixtures, maps URLs, wraps in `Response.json()` | New endpoint or new response variant added |
| **Scenarios** | `scenarios.js` | Pre-configured bundles — "what should the entire API look like?" | New story needs a different API environment |

---

## Checklist

When onboarding a new API endpoint:

- [ ] **Got the API spec from backend** — URL, method, response shape, error codes
- [ ] **Created fixture files** — `demo/mocks/api/{domain}/{scenario}.js`
- [ ] **Registered in `mocks.js`** — lazy-loading entry with `Response.json()` wrapping
- [ ] **Added to scenario bundles in `scenarios.js`** — included in `default` + created new bundles
- [ ] **Re-exported fixture data** — for test assertions
- [ ] **Used in stories** — `parameters: { mocks: scenarios.bundleName }`
- [ ] **Used in tests** — imported response data for assertions
- [ ] **Backend reviewed fixture files** — confirms response shape matches real API

---

## Naming Quick Reference

| What | Pattern | Example |
|------|---------|---------|
| Fixture file (GET state) | `api/{domain}/{state}.js` | `api/accounts/frozen.js` |
| Fixture file (POST result) | `api/{domain}/{action}/ok.js` | `api/cards/hold/ok.js` |
| Scenario bundle | Descriptive name of the environment | `default`, `frozenAccount`, `accountTimeout` |
| Response re-export | `{scenario}{Resource}Response` | `frozenAccountResponse` |
