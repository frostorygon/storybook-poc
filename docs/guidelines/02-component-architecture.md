# Component Architecture & Composition

Components follow a 3-layer model. Each layer has a single responsibility: structure, configuration, or logic. Mixing layers produces "God Components" that can't be reused or tested.

## The 3 Layers

### Layer 1 — Layout (Atom)

A skeleton made of slots and CSS. Zero domain knowledge.

**This codebase:** `status-screen-layout` defines the icon/title/description/actions grid. It doesn't know what an "error" is.

**Rules:**
- No properties beyond structural flags (e.g., `centered`).
- No events.
- Content comes exclusively through `<slot>` tags.

**Anti-pattern — The "Opinionated Layout":**
```javascript
// DON'T — layout should not know about error states
render() {
  return html`<div class="${this.isError ? 'red' : 'green'}">...`;
}
```

---

### Layer 2 — Shell (Molecule)

Wraps a Layout to lock in defaults (icon, color, standard actions) while forwarding remaining slots to the consumer.

**This codebase:** `status-error-screen` pre-fills the warning icon and wires up retry/dismiss buttons, but forwards `custom-content` and `actions` slots for override.

**Rules:**
- Receives flat props (title, message, labels). No objects, no nested data.
- Must forward every slot it doesn't explicitly fill. This is the **Transparent Wrapper Rule**.

**Anti-pattern — The "Phantom Shell":**
```javascript
// DON'T — swallowing the actions slot forces consumers to prop-drill
<status-screen-layout>
  <span slot="title">${errorTitle}</span>
  <!-- actions slot is NOT forwarded — consumer can't override the button -->
</status-screen-layout>

// DO — forward it with a default fallback
<slot name="actions" slot="actions">
  <lion-button @click="${onRetry}">Try Again</lion-button>
</slot>
```

---

### Layer 3 — Smart Component (Organism)

Injects domain logic into a Shell. This is where API calls, redirects, and business rules live.

**This codebase:** `session-expired-error-screen` fills the Shell with auth-specific copy and dispatches `auth-redirect` on button click. `feature-flow` orchestrates the entire journey.

**Rules:**
- Owns the domain logic. The Shell stays dumb.
- Receives services via dependency injection (properties), not global imports. See [08-services-mocking-data.md](./08-services-mocking-data.md).
- Communicates upward exclusively via Custom Events.

---

## Loading States & Data Fetching (Smart vs. Dumb Components)

A common architectural question is: *Should data fetching and API calls live inside the Screen, or inside the Router/Flow Controller?*

This architecture strictly follows the **Container vs. Presentational (Smart vs. Dumb)** pattern. 

### 1. The Rule
**Data fetching and API calls belong in the Flow Controller (Layer 3). Screens (Layer 2) must remain "dumb" and purely presentational.**

### 2. Why?
* **Testability & Storybook:** If a Screen fetches its own data on mount, you cannot render it in Storybook without setting up complex network mocks (e.g., MSW). By keeping Screens dumb, you can instantly render 50 variations of a screen just by passing JSON args into the Storybook Controls panel.
* **Reusability:** A dumb `holdcard-toggle-screen` can be reused in a totally different part of the app (like an admin dashboard) because it isn't hardcoded to a specific API endpoint.
* **Preventing Waterfalls:** If screens fetch their own data, nested screens cause sequential loading waterfalls. The Flow Controller can fetch all necessary data in parallel upfront.

### 3. Handling Loading States
Because the Flow Controller owns the API calls, it also owns the loading state boolean flag (`_isLoading`). However, the **visual presentation** of that loading state belongs to the Screen.

1. **Flow Controller (Logic):** Manages `this._isLoading = true` before the API call and sets it to `false` in the `finally` block.
2. **Passing Props:** The Flow passes the flag down: `<holdcard-toggle-screen ?isLoading=${this._isLoading}>`
3. **Screen (Presentation):** The screen decides *how* to visually represent that state (e.g., swapping a button icon for an inline spinner, adding an `aria-busy` attribute, or lowering opacity).

*Exception:* The only time the Flow Controller handles the visual loader itself is during the *very first initial paint* (e.g., showing a generic full-page skeleton because it doesn't have the data required to mount the child screen yet).

---

## Self-Contained Screens & Thin Router

Every screen variant is its own self-contained component. The orchestrator is a thin state machine that maps step names to components — it never holds text content, fixture data, or per-variant rendering logic.

### The pattern

```
feature-flow (THIN ROUTER)
├── Calls the service (API logic)
├── Maps errorCode → step name
├── _renderStep() — switch statement, one case per screen
└── Listens for navigation events (retry, dismiss)

Each screen (SELF-CONTAINED)
├── Wraps a reusable shell (status-error-screen / status-success-screen)
├── Hardcodes its own title, message, and button labels
├── Owns any unique behavior (redirects, analytics)
└── Emits generic events: 'retry', 'dismiss', 'auth-redirect'
```

### When to create a new screen

Every new variant gets its own component directory — regardless of whether the difference is "just text."

```
Does the new variant differ from existing screens?
  (text, behavior, both)
    │
    └── Create a new self-contained Smart Component.
        It wraps the existing shell and hardcodes its content.
        e.g., timeout-error-screen wraps status-error-screen
```

### Why not use fixtures?

A fixture-driven approach (where the orchestrator holds text content and pipes it as props) has two problems:

1. **The orchestrator becomes a God Component.** Every new error type means editing `feature-flow.js` to add fixture data and routing logic. At 10+ variants, the file is unreadable.
2. **Screens can't be tested or rendered in isolation.** A generic shell needs the orchestrator to provide its content — you can't just `<timeout-error-screen></timeout-error-screen>` in a Storybook story or test.

### Real example from this codebase

| Variant | Component | Wraps | Why it's separate |
|---------|-----------|-------|-------------------|
| Generic error ("Something went wrong") | `generic-error-screen` | `status-error-screen` | Own title/message, retryable |
| Timeout error | `timeout-error-screen` | `status-error-screen` | Own title/message, retryable |
| Session expired | `session-expired-error-screen` | `status-error-screen` | Unique behavior: `auth-redirect`, no retry |
| Hold success | `hold-success-screen` | `status-success-screen` | Own title/message |
| Unhold success | `unhold-success-screen` | `status-success-screen` | Own title/message |

### The orchestrator's `_renderStep()`

```javascript
_renderStep() {
  switch (this._currentStep) {
    case 'toggle':
      return html`<holdcard-toggle-screen ...></holdcard-toggle-screen>`;
    case 'success-held':
      return html`<hold-success-screen @dismiss="${this._handleDismiss}"></hold-success-screen>`;
    case 'error-generic':
      return html`<generic-error-screen @retry="${this._handleRetry}" @dismiss="${this._handleDismiss}"></generic-error-screen>`;
    case 'error-session':
      return html`<session-expired-error-screen></session-expired-error-screen>`;
    // ...
  }
}
```

No props piped. No fixture lookup. Each screen is a self-sufficient web component.

### Adding a new error type

1. Create `src/screens/error/{type}/` with 4 files (`.js`, `.template.js`, `.styles.js`, `index.js`)
2. Wrap `status-error-screen` with hardcoded content
3. Register in `feature-flow.js` scopedElements
4. Add a case to `ERROR_STEP_MAP` and `_renderStep()`
5. The orchestrator diff is ~3 lines — no fixture objects, no prop piping

