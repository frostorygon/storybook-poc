# API Onboarding Guide

How to add a new backend endpoint to the mock layer so it works in Storybook and tests.

---

## What You Need from Backend

Before writing any code, get this from the backend team:

| Info | Example | Where it goes |
|------|---------|---------------|
| **URL pattern** | `GET /api/v1/accounts/:accountId` | `mocks.js` URL key |
| **HTTP method** | GET, POST, PUT, DELETE | `scenarios.js` handler type |
| **Success response body** | `{ accountId: '...', balance: 1234 }` | `api/{domain}/active.js` |
| **Alternative states** | Different response for "frozen" account | `api/{domain}/frozen.js` |
| **Error codes + HTTP status** | `401 → SESSION_EXPIRED`, `504 → TIMEOUT` | `mocks.js` error entries |
| **Request body (if POST/PUT)** | `{ reason: 'lost' }` | Not mocked — but good to document |

> **Tip:** Ask the backend team for a sample `curl` response. Paste it directly into the fixture file.

---

## Step-by-Step: Adding `GET /api/v1/accounts/:accountId`

### Step 1 — Create the fixture data (`api/`)

Create one JS file per **success** response scenario. The folder structure mirrors the API path.

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

### Step 2 — Register ALL responses in `mocks.js`

Add **every possible response** for the URL — success AND errors. This is the single source of truth for "what can this URL return?"

```javascript
// demo/mocks/mocks.js
export default {
  // ... existing entries ...

  '/api/v1/accounts/:accountId': {
    // Success — lazy-loaded from fixture files
    ok:     () => import('./api/accounts/active.js').then(r => Response.json(r.default)),
    frozen: () => import('./api/accounts/frozen.js').then(r => Response.json(r.default)),
    // Errors — inline (small, no fixture file needed)
    genericError:   () => Response.json({ errorCode: 'GENERIC_ERROR' }, { status: 500 }),
    timeout:        () => Response.json({ errorCode: 'TIMEOUT' }, { status: 504 }),
    sessionExpired: () => Response.json({ errorCode: 'SESSION_EXPIRED' }, { status: 401 }),
  },
};
```

**Why lazy for success, inline for errors?** Success fixtures can be large (50+ field objects). Errors are tiny `{ errorCode }` — not worth a separate file.

---

### Step 3 — Create scenario bundles in `scenarios.js`

Group responses from `mocks.js` into named scenarios. **Never create responses here** — only reference `mocks[URL].variant`.

```javascript
// demo/mocks/scenarios.js
const ACCOUNT_URL = '/api/v1/accounts/:accountId';

export default {
  // Happy path — add new endpoint alongside existing ones
  default: [
    // ... existing handlers ...
    http.get(ACCOUNT_URL, mocks[ACCOUNT_URL].ok),
  ],

  // Frozen account — everything else is normal
  frozenAccount: [
    // ... existing handlers from default ...
    http.get(ACCOUNT_URL, mocks[ACCOUNT_URL].frozen),
  ],

  // Account fetch times out
  accountTimeout: [
    // ... existing handlers from default ...
    http.get(ACCOUNT_URL, mocks[ACCOUNT_URL].timeout),
  ],
};

// Re-export fixture data for test assertions
export { default as activeAccountResponse } from './api/accounts/active.js';
export { default as frozenAccountResponse } from './api/accounts/frozen.js';
```

---

### Step 4 — Use in stories

```javascript
import scenarios from '../../../demo/mocks/scenarios.js';

// Pick a whole scenario — the entire API environment in one line
export const ActiveAccount = {
  parameters: { mocks: scenarios.default },
};

export const FrozenAccount = {
  parameters: { mocks: scenarios.frozenAccount },
};

export const Timeout = {
  parameters: { mocks: scenarios.accountTimeout },
};
```

### Step 5 — Use in tests

```javascript
import { activeAccountResponse } from '../demo/mocks/scenarios.js';

it('displays the account holder name', async () => {
  expect(el.shadowRoot.textContent).toContain(activeAccountResponse.holder);
});
```

---

## The Three Layers — Summary

| Layer | File | Responsibility | Key rule |
|-------|------|---------------|----------|
| **Fixture data** | `api/{domain}/*.js` | Hardcoded response objects — what the backend returns | One file per success response shape |
| **Mock registry** | `mocks.js` | ALL responses per URL — success (lazy-loaded) + errors (inline) | Single source of truth for "what can this URL return?" |
| **Scenarios** | `scenarios.js` | Groups responses into named bundles | Only references `mocks[URL].variant` — never creates responses |

---

## Checklist

When onboarding a new API endpoint:

- [ ] **Got the API spec from backend** — URL, method, response shape, error codes
- [ ] **Created fixture files** — `demo/mocks/api/{domain}/{scenario}.js`
- [ ] **Registered ALL responses in `mocks.js`** — success (lazy-loaded) + errors (inline)
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
| Mock entry (success) | Descriptive state name | `ok`, `onHold`, `frozen`, `empty` |
| Mock entry (error) | Error type name | `genericError`, `timeout`, `sessionExpired` |
| Scenario bundle | Describes the overall environment | `default`, `frozenAccount`, `accountTimeout` |
| Response re-export | `{scenario}{Resource}Response` | `frozenAccountResponse` |
