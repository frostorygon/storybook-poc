# Testing Standards

Tests run in **Vitest Browser Mode** with Playwright (Chromium). Components render in a real browser — no jsdom, no happy-dom. Shadow DOM, lifecycle, and Custom Events all behave exactly as they would in production.

## Setup

The test environment requires the scoped custom element registry polyfill. This is configured in `vitest.config.js`:

```javascript
// vitest.config.js
setupFiles: ['./src/vitest-setup.js'],
```

```javascript
// src/vitest-setup.js
import '@webcomponents/scoped-custom-element-registry';
```

Without this, any component using `ScopedElementsMixin` will throw `importNode is not a function`.

---

## Registration in Tests

Components do not self-register (see [01-folder-structure.md](./01-folder-structure.md#registration)). Tests that render a component standalone must call `customElements.define()` at the top of the file:

```javascript
import { HoldcardToggleScreen } from './holdcard-toggle-screen.js';
customElements.define('holdcard-toggle-screen', HoldcardToggleScreen);
```

---

## Mounting Components

Use a `mount()` helper that inserts HTML into the document and returns the element:

```javascript
function mount(html) {
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);
  return container.firstElementChild;
}
```

Clean up between tests:

```javascript
beforeEach(() => { document.body.innerHTML = ''; });
```

Always `await el.updateComplete` after mounting or mutating properties before asserting DOM state.

**Why not `@open-wc/testing` `fixture()`?** This POC uses Vitest for faster iteration and a familiar API. The org standard is `@web/test-runner` + `@open-wc/testing` `fixture()`. See `ARCHITECTURE.md` for the migration path. The `mount()` helper here is a lightweight stand-in that demonstrates the same test patterns.

---

## What to Test

### Component Tests

Every component with logic needs tests covering three areas:

| Area | What to assert | Example |
|------|----------------|---------|
| **Rendering** | Correct elements appear in shadow DOM for given props | `expect(el.shadowRoot.querySelector('h2').textContent).toBe('Jan de Vries')` |
| **State changes** | DOM updates when properties change | Set `el.cardStatus = 'on-hold'` → button text changes |
| **Events** | Correct events fire with correct payloads | Click button → `action` event with `{ action: 'hold' }` |

```javascript
it('emits action:hold when card is active', async () => {
  const el = mount('<holdcard-toggle-screen></holdcard-toggle-screen>');
  el.cardStatus = 'active';
  await el.updateComplete;

  let emitted = null;
  el.addEventListener('action', (e) => { emitted = e.detail; });

  el.shadowRoot.querySelector('lion-button').click();

  expect(emitted).toEqual({ action: 'hold' });
});
```

### Service Tests

Services are pure JavaScript — no DOM needed. Test the public API and error normalization:

```javascript
describe('HoldcardService', () => {
  it('normalizes 401 to SESSION_EXPIRED', () => {
    const svc = new HoldcardService();
    const err = svc._normalizeError(401, {});
    expect(err.errorCode).toBe('SESSION_EXPIRED');
    expect(err.retryable).toBe(false);
  });
});
```

### Orchestrator Tests (Feature Flow)

Orchestrator tests inject mock services and verify the full journey:

```javascript
const mockService = {
  holdCard: () => Promise.reject({ errorCode: 'GENERIC_ERROR', retryable: true }),
};

it('shows error screen on API failure', async () => {
  const el = mount('<feature-flow></feature-flow>');
  el.service = mockService;
  el.cardStatus = 'active';
  await el.updateComplete;

  // Trigger the action
  el.shadowRoot.querySelector('holdcard-toggle-screen')
    .dispatchEvent(new CustomEvent('action', { detail: { action: 'hold' }, bubbles: true, composed: true }));

  await new Promise(r => setTimeout(r, 200));
  await el.updateComplete;

  expect(el._currentStep).toBe('error');
});
```

---

## Anti-Patterns

**Querying across shadow boundaries without `shadowRoot`:**
```javascript
// DON'T — light DOM query won't find shadow DOM content
el.querySelector('.internal-element');

// DO — go through the shadow root
el.shadowRoot.querySelector('.internal-element');
```

**Asserting with arbitrary timeouts:**
```javascript
// FRAGILE — 200ms works on your machine, fails on CI
await new Promise(r => setTimeout(r, 200));

// BETTER — await the service mock's promise, then updateComplete
// (the setTimeout is a known gap in this POC — tracked for improvement)
```

**Testing implementation details:**
```javascript
// DON'T — testing CSS classes couples tests to styling
expect(el.shadowRoot.querySelector('.active-state')).to.exist;

// DO — test behavior or text content
expect(el.shadowRoot.textContent).toContain('Card is active');
```
