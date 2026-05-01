# Mocking Strategy

We use [Mock Service Worker (MSW)](https://mswjs.io/) v2 to intercept network requests at the service-worker level. This means your **real service code** runs in tests and Storybook — the mock lives in the network layer, not in the code.

## Folder Structure

```
src/mocks/
├── handlers/
│   └── cardHandlers.js     ← All card API endpoints + all scenarios
├── handlers.js             ← Barrel: combines all domain handlers
├── server.js               ← Node setup (Vitest)
└── browser.js              ← Browser setup (Storybook)
```

### File naming convention

- **Handler files** use the `{domain}Handlers.js` suffix: `cardHandlers.js`, `authHandlers.js`, `clienteventHandlers.js`
- **One file per API domain** — not per endpoint, not one giant file
- **When to split:** If a handler file exceeds ~200 lines, split into sub-domains: `clienteventEncryptHandlers.js`, `clienteventFormHandlers.js`

---

## Handler File Anatomy

Each handler file exports:

1. **Response constants** — named exports grouped next to their endpoint
2. **Named handlers** — MSW handlers for each endpoint + scenario
3. **`{domain}Handlers`** — array of happy-path defaults for server setup

```javascript
// handlers/cardHandlers.js
import { http, HttpResponse } from 'msw';

const CARD_URL = '/api/v1/cards/:cardId';

// ── GET /api/v1/cards/:cardId ──────────────────────

export const activeCardResponse = {
  cardId: 'CARD-1234', cardStatus: 'active', ...
};

export const getCard             = http.get(CARD_URL, () => HttpResponse.json(activeCardResponse));
export const getCardGenericError = http.get(CARD_URL, () => HttpResponse.json({ errorCode: 'GENERIC_ERROR' }, { status: 500 }));

// ── Defaults ───────────────────────────────────────
export const cardHandlers = [getCard, holdCard, unholdCard];
```

### Naming convention for exports

| Export | Pattern | Example |
|--------|---------|---------|
| Response constant | `{description}Response` | `activeCardResponse`, `holdSuccessResponse` |
| Default handler | `verbResource` | `getCard`, `holdCard` |
| Scenario handler | `verbResource` + variant | `getCardOnHold`, `holdCardTimeout` |
| Default array | `{domain}Handlers` | `cardHandlers` |

---

## Setup Files

### Barrel (`handlers.js`)

```javascript
import { cardHandlers } from './handlers/cardHandlers.js';

export const handlers = [
  ...cardHandlers,
  // ...authHandlers,
];
```

### Vitest (`server.js`)

```javascript
import { setupServer } from 'msw/node';
import { handlers } from './handlers.js';

export const server = setupServer(...handlers);
```

### Storybook (`browser.js`)

```javascript
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers.js';

export const worker = setupWorker(...handlers);
```

---

## Usage in Stories

### Network-level mocking (MSW)

For stories that test full integration (component → service → API):

```javascript
import { getCardSessionExpired } from '../mocks/handlers/cardHandlers.js';

export const SessionExpired = {
  parameters: {
    msw: { handlers: [getCardSessionExpired] },
  },
};
```

### Service-level mocking (injection)

For stories that test orchestration (using `createMockService`):

```javascript
import { holdSuccessResponse } from '../mocks/handlers/cardHandlers.js';

el.service = createMockService();
// createMockService uses holdSuccessResponse internally
```

Both patterns import from the **same handler file** — no duplication.

---

## Usage in Tests

### Default happy path (no setup needed)

```javascript
it('renders active card by default', async () => {
  // server.js provides happy-path handlers automatically
});
```

### Scenario override

```javascript
import { server } from '../mocks/server.js';
import { getCardTimeout } from '../mocks/handlers/cardHandlers.js';

it('shows timeout error', async () => {
  server.use(getCardTimeout);
  // mount component, assert error screen
});
```

---

## Rules

1. **One handler file per API domain.** All endpoints and scenarios for that domain in one file.
2. **Response constants live next to their handlers.** Grouped by endpoint, not in a separate data bag.
3. **Default handlers = happy path.** Use `server.use()` or `parameters.msw` for error/edge scenarios.
4. **Handler naming follows `verbResource` + variant.** Self-documenting exports.
5. **Never import handlers into production code.** They are test/dev only.
6. **Adding a new domain?** Create `{domain}Handlers.js`, add to barrel, done.
