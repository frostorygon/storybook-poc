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
  <span slot="title">${host.errorTitle}</span>
  <!-- actions slot is NOT forwarded — consumer can't override the button -->
</status-screen-layout>

// DO — forward it with a default fallback
<slot name="actions" slot="actions">
  <lion-button @click="${host._onRetry}">Try Again</lion-button>
</slot>
```

---

### Layer 3 — Smart Component (Organism)

Injects domain logic into a Shell. This is where API calls, redirects, and business rules live.

**This codebase:** `session-expired-error-screen` fills the Shell with auth-specific copy and dispatches `auth-redirect` on button click. `feature-flow` orchestrates the entire journey.

**Rules:**
- Owns the domain logic. The Shell stays dumb.
- Receives services via dependency injection (properties), not global imports.
- Communicates upward exclusively via Custom Events.

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
| Session expired | Smart Component → `session-expired-error-screen` | Unique domain logic: dispatches `auth-redirect`, no retry button. |
| Hold success / Unhold success | Fixture → `FLOW_FIXTURES.SUCCESS.held` / `.unheld` | Same dismiss behavior, only copy differs. |

### Anti-pattern — The "God Fixture"

If your fixture object starts containing callback functions, conditional rendering flags, or references to services, it's no longer a fixture — it's a component in disguise. Extract it.
