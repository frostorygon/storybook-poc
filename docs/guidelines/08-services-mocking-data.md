# Services, Mocking & Data

Services own all network communication, data normalization, and external protocol details. Components never see a `fetch()` call, an HTTP status code, or a raw API response shape.

## The Service Contract

A service class exposes async methods that return clean, typed data or throw normalized errors. The consumer doesn't know (or care) whether the data came from REST, GraphQL, a WebSocket, or a mock.

```javascript
// What the orchestrator sees:
const result = await this.service.holdCard('CARD-123');
// → { transactionType: 'held' }

// What it catches:
// → { errorCode: 'SESSION_EXPIRED', retryable: false }
```

**This codebase:** `HoldcardService` handles the `/api/v1/cards` endpoints. `AuthService` handles `/api/v1/auth`.

---

## Dependency Injection

Services are injected as component properties, not imported as singletons.

```javascript
// In the orchestrator:
static get properties() {
  return {
    service: { type: Object },
  };
}

constructor() {
  super();
  this.service = new HoldcardService();  // default for production
}
```

Tests and stories override the default:

```javascript
// Test:
el.service = { holdCard: () => Promise.reject({ errorCode: 'TIMEOUT', retryable: true }) };

// Story:
el.service = createMockService({ holdError: { errorCode: 'GENERIC_ERROR', retryable: true } });
```

**Why not global mocking?** Patching `window.fetch` or using `jest.mock()` is fragile — it affects all tests in the suite and can't be parallelized. Property injection is explicit, isolated, and requires zero test infrastructure.

---

## Error Normalization

Every service must catch raw network failures and convert them to the `ErrorContext` shape before throwing:

```javascript
_normalizeError(status, body) {
  if (status === 401) {
    return { errorCode: 'SESSION_EXPIRED', retryable: false };
  }
  if (status === 408 || status === 504) {
    return { errorCode: 'TIMEOUT', retryable: true };
  }
  return { errorCode: 'GENERIC_ERROR', retryable: true };
}
```

The `ErrorContext` type is defined in `src/types.js`:

```javascript
/**
 * @typedef {Object} ErrorContext
 * @property {string}  errorCode       - machine-readable code
 * @property {boolean} retryable       - show retry button or not
 * @property {any}     [originalError] - raw error for logging (optional)
 */
```

**Rule:** Components never inspect HTTP status codes. They receive an `ErrorContext` and render based on `errorCode` and `retryable`. The mapping lives exclusively in the service.

---

## Bounded Contexts

Each service owns exactly one backend domain. Don't build a "God Service" that talks to every API.

### Heuristics for splitting

| Signal | Action |
|--------|--------|
| Two API calls go to different microservices | Split into separate services |
| A method doesn't share any private helpers with other methods in the class | It probably belongs in a different service |
| The service file exceeds ~150 lines | Review for split opportunities |
| You're injecting ServiceA into ServiceB | Stop. Services don't depend on each other. |

**This codebase:**
- `HoldcardService` → `/api/v1/cards` (hold, unhold, fetch card data)
- `AuthService` → `/api/v1/auth` (session validation, token refresh)

They share nothing. If a future feature needs both card data and auth, the *orchestrator* receives both services, not a combined service.

---

## Anti-Patterns

**Fetching inside components:**
```javascript
// DON'T — the component now knows about HTTP, headers, URLs
async connectedCallback() {
  const res = await fetch('/api/v1/cards/123');
  this.data = await res.json();
}

// DO — delegate to an injected service
async connectedCallback() {
  this.data = await this.service.getCard(this.cardId);
}
```

**Leaking API shapes into the UI:**
```javascript
// DON'T — the template knows about the API response structure
<p>${this.apiResponse.data.attributes.card_status}</p>

// DO — the service normalizes the response
// Service: return { cardStatus: body.data.attributes.card_status }
<p>${this.cardStatus}</p>
```

**Error handling in the template:**
```javascript
// DON'T
${this.error?.response?.status === 401 ? html`<p>Session expired</p>` : ''}

// DO — the orchestrator sets errorType, the screen handles the rest
this._errorType = ERROR_TYPE_MAP[errorCode] || 'SomethingWentWrong';
this._currentStep = 'error';
// → renders <error-screen error-type="SessionExpired">
```

---

## Mocking Strategy

API mocks use [`@web/mocks`](https://www.npmjs.com/package/@web/mocks) to intercept network requests at the service-worker level. Your **real service code** runs in tests and Storybook — the mock lives in the network layer, not in the code.

### The Three-Layer Architecture

Each layer has one job:

| Layer | File | Job |
|-------|------|-----|
| **Fixture data** | `api/{domain}/*.js` | Hardcoded API response objects — the raw JSON the backend returns |
| **Mock registry** | `mocks.js` | The logic layer — maps URLs to fixture data, lazy-loads files, wraps in `Response.json()` |
| **Scenarios** | `scenarios.js` | Pre-configured bundles of handlers — stories pick a scenario by name |

```
┌─────────────────────────────────────────────────────────────────┐
│                        Stories / Tests                          │
│         parameters: { mocks: scenarios.default }               │
└──────────────────────────────┬──────────────────────────────────┘
                               │ picks a scenario bundle
┌──────────────────────────────▼──────────────────────────────────┐
│                      scenarios.js                               │
│   Pre-configured bundles of mock handlers.                     │
│   Each bundle = "what should the entire API look like?"        │
│                                                                 │
│   default: [GET card OK, POST hold OK, POST unhold OK]         │
│   holdError: [GET card OK, POST hold 500]                      │
│   sessionExpired: [GET card 401]                                │
│   Re-exports fixture data for test assertions                  │
└──────────────────────────────┬──────────────────────────────────┘
                               │ reads handlers from
┌──────────────────────────────▼──────────────────────────────────┐
│                        mocks.js                                 │
│   The logic layer — lazy loads fixtures, wraps in Response.    │
│                                                                 │
│   '/api/v1/cards/:cardId': {                                   │
│     ok:     () => import('./api/cards/active.js')              │
│                    .then(r => Response.json(r.default)),        │
│     onHold: () => import('./api/cards/on-hold.js')             │
│                    .then(r => Response.json(r.default)),        │
│   }                                                            │
└──────────────────────────────┬──────────────────────────────────┘
                               │ lazy-imports from
┌──────────────────────────────▼──────────────────────────────────┐
│                     api/{domain}/*.js                           │
│   Hardcoded response objects — copy-paste from backend curls.  │
│   One file per response shape. Backend reviews these in PRs.   │
│                                                                 │
│   active.js  → { cardId: '...', cardStatus: 'active', ... }   │
│   on-hold.js → { cardId: '...', cardStatus: 'on-hold', ... }  │
└─────────────────────────────────────────────────────────────────┘
```

### Folder Structure

```
demo/mocks/
├── api/                     Fixture data (one file per response shape)
│   └── cards/
│       ├── active.js            GET card → active state
│       ├── on-hold.js           GET card → held state
│       ├── hold/ok.js           POST hold → success response
│       └── unhold/ok.js         POST unhold → success response
├── mocks.js                 Logic: URL → lazy-loaded fixtures + Response wrapping
└── scenarios.js             Bundles: pre-configured sets of handlers
```

### Layer 1: Fixture Data (`api/*.js`)

Plain JS objects matching the **exact API response shape**. One file per response scenario.

```javascript
// demo/mocks/api/cards/active.js
export default {
  cardId: 'CARD-1234-5678-9012',
  cardStatus: 'active',
  maskedNumber: '**** **** **** 4567',
  accountHolder: 'Jan de Vries',
};
```

**Rules:**
- Name GET responses after the **entity state**: `active.js`, `on-hold.js`, `frozen.js`
- Name POST/PUT/DELETE responses after the **outcome**: `ok.js` (success is usually one shape)
- These files ARE the API contract — backend reviews them in PRs

### Layer 2: Mock Registry (`mocks.js`)

Maps URL patterns to fixture data. Handles **lazy loading** and **Response wrapping**.

```javascript
// demo/mocks/mocks.js
export default {
  '/api/v1/cards/:cardId': {
    ok:     () => import('./api/cards/active.js').then(r => Response.json(r.default)),
    onHold: () => import('./api/cards/on-hold.js').then(r => Response.json(r.default)),
  },
  '/api/v1/cards/:cardId/hold': {
    ok: () => import('./api/cards/hold/ok.js').then(r => Response.json(r.default)),
  },
  '/api/v1/cards/:cardId/unhold': {
    ok: () => import('./api/cards/unhold/ok.js').then(r => Response.json(r.default)),
  },
};
```

**Why lazy loading?** Fixture files can be large (arrays of 50+ objects). Lazy loading with `import()` keeps Storybook startup fast — fixtures are only loaded when a story actually uses them.

### Layer 3: Scenarios (`scenarios.js`)

Pre-configured **bundles** of mock handlers. Each scenario describes "what should the entire API look like?" — not individual endpoints.

```javascript
// demo/mocks/scenarios.js
import { http } from '@web/mocks/http.js';
import mocks from './mocks.js';

export default {
  // Happy path — all endpoints return success
  default: [
    http.get(CARD_URL, mocks[CARD_URL].ok),
    http.post(HOLD_URL, mocks[HOLD_URL].ok),
    http.post(UNHOLD_URL, mocks[UNHOLD_URL].ok),
  ],

  // Hold action fails — card loads fine but hold returns 500
  holdError: [
    http.get(CARD_URL, mocks[CARD_URL].ok),
    http.post(HOLD_URL, () => new Response('', { status: 500 })),
  ],

  // Session expired — card fetch returns 401
  sessionExpired: [
    http.get(CARD_URL, () => json({ errorCode: 'SESSION_EXPIRED' }, { status: 401 })),
  ],
};

// Re-export fixture data for test assertions
export { default as activeCardResponse } from './api/cards/active.js';
export { default as onHoldCardResponse } from './api/cards/on-hold.js';
```

### Usage in Stories

Stories pick a **scenario bundle** — the entire API environment in one line:

```javascript
import scenarios from '../demo/mocks/scenarios.js';

// "Show me the happy path"
export const HappyPath = {
  parameters: { mocks: scenarios.default },
};

// "Show me what happens when hold fails"
export const HoldFails = {
  parameters: { mocks: scenarios.holdError },
};
```

The `@web/storybook-addon-mocks` provides a "Mocks" panel in the Storybook UI where developers can see, edit, and override responses live.

### Usage in Tests

```javascript
// Import fixture data for assertions
import { activeCardResponse } from '../demo/mocks/scenarios.js';

it('renders the account holder name', async () => {
  const el = mount('<holdcard-toggle-screen></holdcard-toggle-screen>');
  el.accountHolder = activeCardResponse.accountHolder;
  await el.updateComplete;
  expect(el.shadowRoot.textContent).toContain('Jan de Vries');
});
```

### Adding a New API Endpoint

1. **Create fixture file:** `demo/mocks/api/{domain}/{scenario}.js`
2. **Register in `mocks.js`** — add lazy-loading entry with `Response.json()` wrapping
3. **Add to scenario bundles in `scenarios.js`** — include in `default` and create new scenarios as needed
4. **Use in story:** `parameters: { mocks: scenarios.scenarioName }`
5. **Use in test:** `import { fixtureResponse } from '../demo/mocks/scenarios.js'`

See [Guideline 10 — API Onboarding](./10-api-onboarding.md) for a full step-by-step walkthrough.

### Naming Conventions

#### Fixture files (`api/`)

| Endpoint type | Name after... | Example |
|---|---|---|
| GET (entity state) | The **state** | `active.js`, `on-hold.js`, `frozen.js`, `empty.js` |
| POST/PUT/DELETE (action result) | The **outcome** | `ok.js`, `created.js` |

#### Scenario bundles (`scenarios.js`)

| Scenario | What it describes |
|---|---|
| `default` | Happy path — everything succeeds |
| `holdError` | Hold action fails (500) |
| `sessionExpired` | Auth fails (401) |
| `timeout` | Network timeout (504) |
| `emptyState` | GET returns empty list |

#### Response re-exports (`scenarios.js`)

Pattern: **`{scenario}{Resource}Response`** — for test assertions.

| Export | Example |
|---|---|
| `activeCardResponse` | `import('./api/cards/active.js').default` |
| `onHoldCardResponse` | `import('./api/cards/on-hold.js').default` |

### Rules

1. **One scenarios file per feature.** All scenario bundles for the feature in one file.
2. **Fixture data lives in `api/` files.** Grouped by domain, one file per response shape.
3. **`mocks.js` is the logic layer.** Lazy loading + Response wrapping. No HTTP handling.
4. **Scenarios are bundles, not individual handlers.** A scenario = "what should the entire API look like?"
5. **`default` scenario = happy path.** Every endpoint returns success. This is what most stories get.
6. **Never import mock files into production code.** They are test/dev only.

