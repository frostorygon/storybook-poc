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

**This codebase:** `error-screen` handles all error variants via a `errorType` prop — each variant's render function wires its own buttons and events. `feature-flow` orchestrates the entire journey.

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

## Variant-Driven Screens & Thin Router

Screen variants (different error types, success states) are handled by a **single component per screen category** with a `type` property. Each variant has its own render function in the template file, giving full control over copy, buttons, and behavior — without creating separate component directories per variant.

This follows the established `account-closure` ErrorScreen pattern used in production.

### The pattern

```
feature-flow (THIN ROUTER)
├── Calls the service (API logic)
├── Maps errorCode → errorType string
├── _renderStep() — 3 cases: toggle, error, success
└── Passes variant type as attribute: error-type="Timeout"

error-screen (VARIANT-DRIVEN)
├── errorType property: 'SomethingWentWrong' | 'Timeout' | 'SessionExpired'
├── render() switches on errorType
├── Template exports one render function per variant
├── Component has all possible handlers (retry, dismiss, auth-redirect)
└── Each render function wires only the handlers it needs
```

### Real example from this codebase

| Variant | Component | `error-type` value | Behavior |
|---------|-----------|-------------------|----------|
| Generic error | `error-screen` | `SomethingWentWrong` | Retry + Dismiss |
| Timeout error | `error-screen` | `Timeout` | Retry + Dismiss |
| Session expired | `error-screen` | `SessionExpired` | Auth Redirect |
| Hold success | `success-screen` | `Held` | Dismiss |
| Unhold success | `success-screen` | `Unheld` | Dismiss |

### The orchestrator's `_renderStep()`

```javascript
_renderStep() {
  switch (this._currentStep) {
    case 'toggle':
      return html`<holdcard-toggle-screen ...></holdcard-toggle-screen>`;
    case 'error':
      return html`<error-screen
        error-type="${this._errorType}"
        @retry="${this._handleRetry}"
        @dismiss="${this._handleDismiss}"
        @auth-redirect="${this._handleAuthRedirect}">
      </error-screen>`;
    case 'success':
      return html`<success-screen
        success-type="${this._successType}"
        @dismiss="${this._handleDismiss}">
      </success-screen>`;
  }
}
```

Only 3 cases. Only 2 screen registrations. The variant prop handles all variation.

### Adding a new error variant

1. Add a render function in `error-screen.template.js` (e.g., `renderRateLimited`)
2. Add a case to the `render()` switch in `error-screen.js`
3. Update the `ErrorType` typedef
4. Add a Storybook story in `error-screen.stories.js`
5. **The orchestrator diff is 0 lines** — it already renders `<error-screen>` and the type mapping covers it

### When to extract a variant into its own component

Only when a variant grows so complex that it needs its **own state machine, service injection, or lifecycle hooks** — not just different text or buttons. In practice, this is rare. If it happens, create a subdirectory under `screens/error/` for that specific variant.

### Why not use fixtures?

A fixture-driven approach (where the orchestrator holds text content and pipes it as props) has two problems:

1. **The orchestrator becomes a God Component.** Every new error type means editing the router to add fixture data and rendering logic.
2. **Screens can't be tested independently.** A generic shell needs external content — you can't just render `<error-screen error-type="Timeout">` in a story or test.

### Why not one component per variant?

Creating a separate 4-file directory for each text-only variant causes:

1. **File explosion.** 5 variants × 4 files = 20 files for what's essentially different strings.
2. **Identical logic duplication.** `generic-error-screen.js` and `timeout-error-screen.js` are the same class — only the template text differs.
3. **Orchestrator bloat.** Each variant needs its own scoped element registration and switch case.

