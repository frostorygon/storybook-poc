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

---

## JSDoc Types

This project uses JSDoc `@typedef` + `// @ts-check` for type safety without a TypeScript build step. This gives you IDE IntelliSense, type checking, and auto-complete — all from plain `.js` files.

### Where types live

| Scope | Location | Example |
|-------|----------|---------|
| **Shared** across components | `src/types.js` | `CardData`, `ErrorContext`, `CardStatus` |
| **Component-specific** | Inline in the component or template file | `ErrorType`, `RetryableErrorParams` |

### The `types.js` file

Shared types go in `src/types.js`. Any file can reference them:

```javascript
// src/types.js
/**
 * @typedef {Object} CardData
 * @property {string}     cardId
 * @property {CardStatus} cardStatus
 * @property {string}     maskedNumber
 * @property {string}     accountHolder
 */

/**
 * @typedef {Object} ErrorContext
 * @property {string}  errorCode
 * @property {boolean} retryable
 * @property {any}     [originalError]
 */

export {};  // Makes this an ES module so import() works
```

Reference from another file:

```javascript
/** @type {import('../types.js').ErrorContext} */
const error = { errorCode: 'TIMEOUT', retryable: true };
```

### Enable type checking: `// @ts-check`

Add `// @ts-check` at the top of any `.js` file to enable IDE type checking:

```javascript
// @ts-check
import { LitElement } from 'lit';

export class ErrorScreen extends LitElement {
  constructor() {
    super();
    /** @type {ErrorType} */
    this.errorType = 'SomethingWentWrong';
  }
}
```

Without `// @ts-check`, JSDoc types still provide IntelliSense (autocomplete, hover docs) but won't flag errors. With it, the IDE treats the file like TypeScript.

### Named `@typedef` for template parameters

Template functions receive destructured parameters. **Always define a named `@typedef`** — not generic `{object}`:

```javascript
// ❌ BAD — IDE shows "{object}" on hover, no autocomplete for properties
/**
 * @param {object} params
 */
export function templateTimeout({ onRetry, onDismiss }) { ... }

// ✅ GOOD — IDE shows "RetryableErrorParams" with full property docs
/**
 * @typedef {object} RetryableErrorParams
 * @property {(e: Event) => void} onRetry - Called when user clicks retry
 * @property {(e: Event) => void} onDismiss - Called when user clicks dismiss
 */

/**
 * @param {RetryableErrorParams} params
 */
export function templateTimeout({ onRetry, onDismiss }) { ... }
```

**Why named types?**
- IDE hover shows the type name + all properties
- The typedef is reusable across variants with the same signature
- PR reviewers see the contract at a glance without reading the function body

### Union types for variant props

Use union types for `type` properties to constrain valid values:

```javascript
/**
 * @typedef {'SomethingWentWrong' | 'Timeout' | 'SessionExpired'} ErrorType
 */

constructor() {
  super();
  /** @type {ErrorType} */
  this.errorType = 'SomethingWentWrong';
}
```

This gives you autocomplete when setting the prop and a warning if you pass an invalid value.

### Rules

1. **Shared types** → `src/types.js`. Component-specific types → inline in the file that defines them.
2. **Always use named `@typedef`** for template parameters. Never `{object}` or `{any}`.
3. **Union types** for constrained string props (`ErrorType`, `CardStatus`, `CardAction`).
4. **`// @ts-check`** on all source files under `src/`. Optional on stories and tests.
5. **`export {}`** at the end of `types.js` — required for `import()` resolution.
