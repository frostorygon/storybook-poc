# Storybook Standards

Storybook is not a developer toy — it's the primary interface for four distinct audiences. Every story, doc page, and control configuration serves at least one of them.

## Audiences

| Role | What they need from Storybook |
|------|------------------------------|
| **Product Owner** | Walk through each user journey end-to-end. See every success and failure state. |
| **Backend Engineer** | Verify the API contract. Check fixture shapes. Confirm error code mappings. |
| **Frontend Engineer** | Interactive playground with controls. Component API docs. Copy-pasteable usage. |
| **QA / Tester** | Every visual state as a static story target for screenshot regression. |

The `introduction.mdx` navigation table routes each audience to their entry point. Update it when adding new sections.

---

## Sidebar Hierarchy

This POC uses a flat, scenario-driven hierarchy configured in `.storybook/preview.js`:

```
Docs & Overview/
  Introduction            ← landing page, audience routing table
Flows/
  Overview                ← scenario coverage matrix
  API Fixtures            ← fixture shapes for backend reference
  Scenarios/
    Hold Card             ← interactive play test
    Unhold Card
    API Unavailable → Error
    Session Expired → Error
Screens/
  Error/
    Session Expired       ← standalone smart component
  Components/
    Status Error Screen   ← reusable shell with controls
    Status Success Screen
```

The `title` property in each `.stories.js` file drives this. Keep hierarchy to a maximum of 3 levels.

---

## Story Patterns

### The Default Story (Interactive Playground)

The first exported story is always `Default`. It maps all public properties to Storybook Controls so engineers can experiment with the component interactively.

```javascript
export const Default = {
  args: {
    errorTitle: 'Something went wrong',
    errorMessage: 'Please try again later.',
    retryable: true,
    retryLabel: 'Try Again',
  },
};
```

### Outcome Variants (Visual Regression Targets)

Export explicit stories for every meaningful visual state. Each variant should boot directly into that state — no user interaction required.

```javascript
export const SessionExpired = {
  args: {
    errorTitle: 'Session expired',
    errorMessage: 'Please log in again.',
    retryable: false,
  },
};
```

**Why explicit variants?** QA tools (Chromatic, Playwright screenshot tests) capture each exported story as a snapshot. If a state only exists behind a button click, it won't be captured.

### Flow Stories (Mock Service Injection)

Flow-level stories inject mock services instead of relying on real API calls or mock modes baked into production code.

```javascript
function createMockService({ holdError } = {}) {
  return {
    holdCard: holdError
      ? () => Promise.reject(holdError)
      : () => Promise.resolve({ transactionType: 'held' }),
    unholdCard: () => Promise.resolve({ transactionType: 'unheld' }),
  };
}

export const APIUnavailableError = {
  render: () => {
    const el = document.createElement('feature-flow');
    el.setAttribute('cardStatus', 'active');
    el.service = createMockService({
      holdError: { errorCode: 'GENERIC_ERROR', retryable: true },
    });
    return el;
  },
};
```

**Anti-pattern — Mock modes in production code:**
```javascript
// DON'T — test infrastructure leaking into the component
<feature-flow mockErrorMode="SESSION_EXPIRED">

// DO — inject a mock service, same pattern as unit tests
el.service = createMockService({ holdError: { ... } });
```

---

## MDX Documentation Pages

Every component that appears in the Storybook sidebar should have a `.mdx` doc page. At minimum it covers:

1. **Purpose** — one sentence: what this component does
2. **When to use / when NOT to use** — prevent misuse
3. **Props table** — auto-generated from `argTypes` where possible
4. **Events** — name, payload shape, when it fires
5. **Slots** — name, purpose, default content

Keep prose short. If you need more than 3 paragraphs to explain a component, the component is probably too complex.
