# State, Properties & Events

Three rules govern component communication: props flow down, events bubble up, internal state stays private.

## Public Properties

Public properties are the component's API. Parents set them via attributes or JavaScript properties.

```javascript
static get properties() {
  return {
    errorTitle: { type: String },   // attribute: error-title
    retryable:  { type: Boolean },  // attribute: retryable (presence = true)
  };
}
```

**Conventions:**
- `camelCase` names. Lit auto-maps to `kebab-case` attributes.
- Always specify `type` — Lit uses it for attribute serialization.
- Initialize every property in the constructor with a sensible default.

**Anti-pattern — Object props on Shells:**
```javascript
// DON'T — Shells receive flat props, not data objects
static get properties() {
  return { errorContext: { type: Object } };
}

// DO — flat props keep the Shell dumb and testable
static get properties() {
  return {
    errorTitle:   { type: String },
    errorMessage: { type: String },
    retryable:    { type: Boolean },
  };
}
```

Object props are fine on orchestrators (`feature-flow`) that need to pass around `ErrorContext` internally. The rule applies to Shells and Layouts.

---

## Internal State

Internal state drives rendering but is invisible to consumers. Lit will not create an HTML attribute for it.

```javascript
static get properties() {
  return {
    _isLoading:   { type: Boolean, state: true },
    _currentStep: { type: String,  state: true },
  };
}
```

**Conventions:**
- Always prefix with `_`.
- Always set `state: true`.
- Never read internal state from a parent. If a parent needs to know, expose it as a public property or dispatch an event.

---

## Events

Components communicate upward exclusively via `CustomEvent`. No callback props.

```javascript
_onRetryClick() {
  this.dispatchEvent(new CustomEvent('retry', {
    bubbles: true,
    composed: true,
  }));
}
```

**Conventions:**

| Convention | Rule |
|-----------|------|
| Names | `kebab-case`, action-oriented: `retry`, `dismiss`, `auth-redirect`, `action` |
| Bubbling | Default to `{ bubbles: true, composed: true }` so events cross Shadow DOM boundaries |
| Payload | Use `detail` sparingly. Prefer `detail: { action: 'hold' }` over `detail: { action: 'hold', cardId: '...', timestamp: '...' }` |
| Listening | Parent uses `@event-name="${this._handler}"` in its template |

**Anti-pattern — Callback props:**
```javascript
// DON'T — breaks the events-up contract
static get properties() {
  return { onRetry: { type: Function } };
}

// DO — use events
this.dispatchEvent(new CustomEvent('retry'));
```

---

## Method Naming

| Category | Prefix | Example |
|----------|--------|---------|
| Event handlers | `_on` | `_onRetryClick()`, `_onFormSubmit()` |
| Private helpers | `_` | `_normalizeError()`, `_calculateTotal()` |
| Render helpers | `_render` | `_renderErrorScreen()`, `_renderToggle()` |
| Public methods | none | `focus()`, `reset()` — rare, prefer data-down/events-up |

For the full Lit reactive property reference, see the [Lit documentation](https://lit.dev/docs/components/properties/).
