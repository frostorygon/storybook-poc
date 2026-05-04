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

## Decision Framework: Fixture vs. Smart Component

When you need a new screen variant (e.g., "timeout error"), you must choose between a data fixture and a new Web Component file. Use this flowchart:

```
Does the new variant need its own domain logic?
  (API calls, redirects, auth, analytics)
    │
    ├── YES → Create a Smart Component
    │         e.g., session-expired-error-screen
    │         (has its own auth-redirect logic)
    │
    └── NO → Is the difference only in text/copy?
              │
              ├── YES → Use a Fixture in the orchestrator
              │         e.g., FLOW_FIXTURES.ERRORS.TIMEOUT
              │         (same retry behavior, different title)
              │
              └── NO → Use a Fixture with conditional props
                        e.g., retryable=true vs retryable=false
```

### Real example from this codebase

| Variant | Pattern Used | Why |
|---------|-------------|-----|
| Generic error ("Something went wrong") | Fixture in `feature-flow.js` → `FLOW_FIXTURES.ERRORS.GENERIC_ERROR` | Same retry behavior, only text differs. |
| Timeout error | Fixture → `FLOW_FIXTURES.ERRORS.TIMEOUT` | Same retry behavior, different title. |
| Session expired | Smart Component → `session-expired-error-screen.js` | Unique domain logic: dispatches `auth-redirect`, no retry button. |
| Hold success / Unhold success | Fixture → `FLOW_FIXTURES.SUCCESS.held` / `.unheld` | Same dismiss behavior, only copy differs. |

### Anti-pattern — The "God Fixture"

If your fixture object starts containing callback functions, conditional rendering flags, or references to services, it's no longer a fixture — it's a component in disguise. Extract it.
