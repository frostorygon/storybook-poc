# Template Patterns

Templates are extracted `render()` functions. They live in `[name].template.js` and return `html` tagged template literals.

## Why separate?

A template file lets you see the markup without scrolling past class boilerplate (properties, lifecycle, event dispatching). It does NOT change the component's architecture — the template is still part of the same component boundary.

**When to keep inline instead:** If your template is under ~30 lines, separating it adds a file without adding clarity. Use judgment.

---

## Core Rule: Templates Are Dumb

A template receives everything it needs through its function arguments. It does NOT:

- Import or call services
- Dispatch `CustomEvent`s (that's the component's job)
- Maintain state
- Perform side effects (fetch, console.log, localStorage)
- Import business logic

A template ONLY does:

- Interpolate values into HTML
- Conditionally show/hide blocks (`if`/ternary)
- Iterate over arrays (`.map()`)
- Forward event handlers that were passed to it

```javascript
// ✅ GOOD — template is pure interpolation
export function template({ title, items, onItemClick }) {
  return html`
    <h2>${title}</h2>
    <ul>
      ${items.map(item => html`
        <li @click="${() => onItemClick(item.id)}">${item.name}</li>
      `)}
    </ul>
  `;
}

// ❌ BAD — template is doing the component's job
export function template({ service, cardId }) {
  const data = service.getCard(cardId);  // Side effect!
  return html`<h2>${data.name}</h2>`;
}
```

---

## Function Arguments: Props and Handlers

Templates receive two kinds of arguments:

| Kind | Naming convention | Example |
|------|-------------------|---------|
| **Data props** | Noun — describes what it is | `title`, `cardStatus`, `items` |
| **Event handlers** | `on` + verb — describes when it fires | `onAction`, `onRetry`, `onDismiss` |

### How event handlers work

The component wraps its own methods and passes them to the template:

```javascript
// component — [name].js
render() {
  return template({
    cardStatus: this.cardStatus,       // data: passed directly
    onAction: () => this._onAction(),  // handler: arrow wraps the method
  });
}

_onAction() {
  // The COMPONENT dispatches the CustomEvent — not the template
  this.dispatchEvent(new CustomEvent('action', {
    detail: { action: this.cardStatus === 'active' ? 'hold' : 'unhold' },
    bubbles: true,
    composed: true,
  }));
}
```

```javascript
// template — [name].template.js
export function template({ cardStatus, onAction }) {
  return html`
    <lion-button @click="${onAction}">
      ${cardStatus === 'active' ? 'Hold Card' : 'Unhold Card'}
    </lion-button>
  `;
}
```

### Why not dispatch events from the template?

Templates are plain functions that return `TemplateResult` — they are not custom elements and have no access to `this.dispatchEvent()`. The flow is:

```
DOM event (click) → template handler (onAction) → component method (_onAction) → CustomEvent
```

This preserves "events up, props down":
- **Props down**: component → template (data and handlers)
- **Events up**: template DOM element → component method → `CustomEvent` bubbles to parent

The template never "knows" about the parent. It just calls the handler it received.

---

## Translations in Templates

When a component uses `LocalizeMixin`, pass `msgLit` as a prop:

```javascript
// component
render() {
  return template({
    cardStatus: this.cardStatus,
    msgLit: (key) => this.msgLit(key),
    onAction: () => this._onAction(),
  });
}
```

```javascript
// template
export function template({ cardStatus, msgLit, onAction }) {
  return html`
    <h2>${msgLit('holdcard-toggle:title')}</h2>
    <lion-button @click="${onAction}">
      ${cardStatus === 'active'
        ? msgLit('holdcard-toggle:holdButton')
        : msgLit('holdcard-toggle:unholdButton')}
    </lion-button>
  `;
}
```

**Rule:** The template calls `msgLit(key)` but does not import `@lion/ui/localize.js` or manage the locale. That's the component/mixin's job.

### Translation file structure

Each component that has user-facing strings gets a `translations/` folder:

```
holdcard-toggle-screen/
├── holdcard-toggle-screen.js
├── holdcard-toggle-screen.template.js
├── holdcard-toggle-screen.styles.js
└── translations/
    ├── en-GB.js
    └── nl-NL.js
```

### Translation key naming

Keys are **flat** and **semantic**. The namespace already provides scope — don't repeat context in the key name.

```javascript
// ✅ GOOD — flat, semantic keys
export default {
  title: 'Session expired',
  description: 'Your session has expired. Please log in again to continue.',
  loginButton: 'Go to Login',
};

// ❌ BAD — redundant context in key names
export default {
  'session-expired-error.title': 'Session expired',
  'session-expired-error.description.text': 'Your session has expired...',
  'session-expired-error.actions.login-button.label': 'Go to Login',
};
```

The namespace does the scoping: `msgLit('session-expired:title')` is already unambiguous.

---

## Anti-Patterns

### The "Smart Template"

```javascript
// ❌ Template imports a service and fetches data
import { HoldcardService } from '../../services/holdcard-service.js';

export function template({ cardId }) {
  const svc = new HoldcardService();
  const data = svc.getCard(cardId);  // side effect!
  return html`...`;
}
```

If the template needs data, the **component** fetches it and passes it as a prop.

### The "Event-Dispatching Template"

```javascript
// ❌ Template creates and dispatches CustomEvents
export function template({ host }) {
  return html`
    <button @click="${() => {
      host.dispatchEvent(new CustomEvent('action', { ... }));
    }}">
  `;
}
```

The template should call a handler (`onAction`). The component's method dispatches the event. This keeps the boundary clean: the template doesn't need a reference to the host element.

### The "God Props"

```javascript
// ❌ Passing the entire component instance
render() {
  return template(this);
}
```

This defeats the purpose of separation. The template has access to every method, every private property. Use destructured props to make the contract explicit.
