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

// DO — the orchestrator routes based on errorCode
${this._errorContext?.errorCode === 'SESSION_EXPIRED'
  ? html`<session-expired-error-screen></session-expired-error-screen>`
  : this._renderGenericError()}
```

---

## Mocking Strategy

API mocks use [`@web/mocks`](https://www.npmjs.com/package/@web/mocks) to intercept network requests at the service-worker level. Your **real service code** runs in tests and Storybook — the mock lives in the network layer, not in the code.

### Folder Structure

```
demo/mocks/
├── api/                     Response payloads (one file per endpoint+scenario)
│   └── cards/
│       ├── active.js            GET /api/v1/cards/:cardId (active card)
│       ├── on-hold.js           GET /api/v1/cards/:cardId (held card)
│       ├── hold/ok.js           POST /api/v1/cards/:cardId/hold (success)
│       └── unhold/ok.js         POST /api/v1/cards/:cardId/unhold (success)
├── mocks.js                 Registry: endpoint paths → named scenarios
└── scenarios.js             @web/mocks handlers — SINGLE SOURCE OF TRUTH
```

### How it works

1. **Response data** lives in `demo/mocks/api/` — plain JS objects that `export default`
2. **`mocks.js`** maps endpoint URL patterns to named scenarios:
   ```javascript
   export default {
     '/api/v1/cards/:cardId':        { ok: activeCard, onHold: onHoldCard },
     '/api/v1/cards/:cardId/hold':   { ok: holdOk },
     '/api/v1/cards/:cardId/unhold': { ok: unholdOk },
   };
   ```
3. **`scenarios.js`** creates `@web/mocks` handlers and re-exports both handlers (for stories) and raw response data (for test assertions):
   ```javascript
   import { http } from '@web/mocks/http.js';
   import mocks from './mocks.js';

   // Handler for stories (parameters.mocks)
   export const getCard = http.get(CARD_URL, () => json(mocks[CARD_URL].ok));

   // Re-export for test assertions
   export { default as activeCardResponse } from './api/cards/active.js';
   ```
4. **Stories** import handlers: `import { getCard, holdCard } from '../demo/mocks/scenarios.js'`
5. **Tests** import the same file: `import { holdSuccessResponse } from '../demo/mocks/scenarios.js'`

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

### Usage in Stories

```javascript
import { getCard, holdCard } from '../demo/mocks/scenarios.js';

export const HoldCard = {
  parameters: {
    mocks: [getCard, holdCard],  // ← @web/storybook-addon-mocks reads this
  },
  render: () => html`<feature-flow ...></feature-flow>`,
};
```

The `@web/storybook-addon-mocks` provides a "Mocks" panel in the Storybook UI where developers can see, edit, and override responses live.

### Usage in Tests

```javascript
// Import response data for assertions
import { activeCardResponse } from '../demo/mocks/scenarios.js';

it('renders the account holder name', async () => {
  const el = mount('<holdcard-toggle-screen></holdcard-toggle-screen>');
  el.accountHolder = activeCardResponse.accountHolder;
  await el.updateComplete;
  expect(el.shadowRoot.textContent).toContain('Jan de Vries');
});
```

### Adding a New API Endpoint

1. **Create response file:** `demo/mocks/api/{domain}/{scenario}.js`
2. **Register in `demo/mocks/mocks.js`**
3. **Add handler in `demo/mocks/scenarios.js`**
4. **Use in story:** `parameters: { mocks: [newHandler] }`
5. **Use in test:** `import { newResponse } from '../demo/mocks/scenarios.js'`

See `ARCHITECTURE.md` for the step-by-step walkthrough with code examples.

### Rules

1. **One scenarios file per feature.** All endpoints and scenarios for the feature in one file.
2. **Response data lives in `api/` files.** Grouped by endpoint, exported as `default`.
3. **Default handlers = happy path.** Use per-story `parameters.mocks` for error/edge scenarios.
4. **Handler naming follows `verbResource` + variant.** Self-documenting exports.
5. **Never import handlers into production code.** They are test/dev only.
