# Services & Data Layer

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
