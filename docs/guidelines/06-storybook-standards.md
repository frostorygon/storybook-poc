# Storybook Standards

Storybook is not a developer toy — it's the primary interface for four distinct audiences. Every story, doc page, and control configuration serves at least one of them.

## Audiences

| Role | What they need from Storybook |
|------|-------------------------------|
| **Product Owner** | Walk through each user journey end-to-end. See every success and failure state. |
| **Backend Engineer** | Verify the API contract. Check fixture shapes. Confirm error code mappings. |
| **Frontend Engineer** | Interactive playground with controls. Component API docs. Copy-pasteable usage. |
| **QA / Tester** | Every visual state as a static story target for screenshot regression. |

The `introduction.mdx` navigation table routes each audience to their entry point.

---

## Sidebar Hierarchy

This POC uses a flat, scenario-driven hierarchy configured in `.storybook/preview.js`:

```
Docs & Overview/
  Introduction            ← landing page, audience routing table
  Open-WC Alignment       ← standards compliance status
Flows/
  Overview                ← scenario coverage matrix
  API Fixtures            ← fixture shapes for backend reference
  Scenarios/
    Hold Card             ← interactive play test
    Unhold Card
    API Unavailable → Error
    Session Expired → Error
    Network Timeout → Error
Screens/
  Error/
    Something Went Wrong  ← variant: error-type="SomethingWentWrong"
    Request Timed Out     ← variant: error-type="Timeout"
    Session Expired       ← variant: error-type="SessionExpired"
  Toggle Screen           ← with Controls + Actions + Interactions
Components/
  Layout/
    Status Screen Layout  ← shared layout atom
  Error Screen            ← reusable shell with controls + edge cases
  Success Screen          ← reusable shell with dismiss action + edge cases
```

The `title` property in each `.stories.js` file drives this. Keep hierarchy to a maximum of 3 levels.

---

## Story Format: CSF3

All stories use Component Story Format v3 (CSF3). This is the `export default` meta + named object exports pattern. Copy-paste the templates below for new components.

### Template: Reusable Component Story (Copy This)

```javascript
/**
 * [Component Name] Stories
 *
 * Demonstrates: argTypes, fn() spies, play() with step(), edge cases.
 */

import { html } from 'lit';
import { fn, expect, within, userEvent } from 'storybook/test';
import { MyComponent } from '../path/to/my-component.js';

// Register standalone — components do not self-register (see 01-folder-structure.md)
customElements.define('my-component', MyComponent);

export default {
  title: 'Screens / My Component',
  component: 'my-component',

  // ── Controls ──────────────────────────────────────────────────────
  argTypes: {
    // Group by category for a clean Controls panel
    myTitle: {
      control: 'text',
      description: 'Main heading text.',
      table: {
        category: 'Content',
        defaultValue: { summary: '' },
      },
    },
    isActive: {
      control: 'boolean',
      description: 'Whether the component is in active state.',
      table: {
        category: 'State',
        defaultValue: { summary: 'false' },
      },
    },
    variant: {
      control: { type: 'radio' },
      options: ['primary', 'secondary', 'danger'],
      description: 'Visual variant of the component.',
      table: {
        category: 'Appearance',
        defaultValue: { summary: 'primary' },
      },
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: 'Size of the component.',
      table: {
        category: 'Appearance',
        defaultValue: { summary: 'medium' },
      },
    },
    // Events — use fn() in args, action: name in argTypes
    onAction: {
      action: 'action',
      description: 'Fired when the primary button is clicked.',
      table: { category: 'Events' },
    },
    onDismiss: {
      action: 'dismiss',
      description: 'Fired when the dismiss button is clicked.',
      table: { category: 'Events' },
    },
  },

  // ── Default Args ──────────────────────────────────────────────────
  // fn() creates a spy: logs to Actions panel + assertable in play()
  args: {
    myTitle: 'Default Title',
    isActive: false,
    variant: 'primary',
    size: 'medium',
    onAction: fn(),
    onDismiss: fn(),
  },

  // ── Render ────────────────────────────────────────────────────────
  // IMPORTANT: Use property assignment, not HTML attributes.
  // el.prop = value triggers LitElement reactivity.
  // HTML attribute binding (errorTitle="${args.x}") does NOT work
  // for booleans and complex types.
  render: (args) => {
    const el = document.createElement('my-component');
    el.myTitle = args.myTitle;
    el.isActive = args.isActive;
    el.variant = args.variant;
    el.size = args.size;
    el.addEventListener('action', args.onAction);
    el.addEventListener('dismiss', args.onDismiss);
    return el;
  },
};

// ── Stories ──────────────────────────────────────────────────────────

export const Default = {
  name: 'Default',
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Verify content renders', async () => {
      await expect(canvas.getByText('Default Title')).toBeInTheDocument();
    });

    await step('Click primary action → verify event', async () => {
      await userEvent.click(canvas.getByRole('button'));
      await expect(args.onAction).toHaveBeenCalledTimes(1);
    });
  },
};

// ── Edge Cases ──────────────────────────────────────────────────────

export const EmptyContent = {
  name: 'Edge: Empty Content',
  args: { myTitle: '', isActive: false },
};

export const LongContent = {
  name: 'Edge: Long Content',
  args: {
    myTitle: 'A very long title that will test how the component handles overflow and text wrapping behavior across multiple lines',
  },
};
```

### Template: Smart Component Story (No Controls)

```javascript
/**
 * Smart components have internal state and hard-coded content.
 * Only events are exposed to stories.
 */

import { html } from 'lit';
import { fn, expect, within, userEvent } from 'storybook/test';
import { SmartComponent } from '../path/to/smart-component.js';

customElements.define('smart-component', SmartComponent);

export default {
  title: 'Screens / Smart Component',
  component: 'smart-component',

  argTypes: {
    onNavigate: {
      action: 'navigate',
      description: 'Fired when navigation is triggered.',
      table: { category: 'Events' },
    },
  },
  args: {
    onNavigate: fn(),
  },
  render: (args) => {
    const el = document.createElement('smart-component');
    el.addEventListener('navigate', args.onNavigate);
    return el;
  },
};

export const Default = {
  name: 'Default',
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('Click action → verify event', async () => {
      await userEvent.click(canvas.getByText('Go'));
      await expect(args.onNavigate).toHaveBeenCalled();
    });
  },
};
```

### Template: Flow Story (With API Mocks)

```javascript
/**
 * Flow stories use @web/storybook-addon-mocks to intercept API calls.
 * Each story gets its own mock set via parameters.mocks.
 */

import { html } from 'lit';
import { within, userEvent } from 'storybook/test';
import '../src/feature-flow.js';
import { getCard, holdCard, holdCardGenericError } from '../demo/mocks/scenarios.js';

export default {
  title: 'Flows / Scenarios',
};

export const HappyPath = {
  name: 'Hold Card',
  parameters: {
    mocks: [getCard, holdCard],
  },
  render: () => html`
    <feature-flow
      cardStatus="active"
      accountHolder="Jan de Vries"
      cardId="CARD-1234-5678-9012">
    </feature-flow>
  `,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Click hold button', async () => {
      const btn = await canvas.findByText('Hold Card');
      await userEvent.click(btn);
    });

    await step('Verify success screen', async () => {
      await canvas.findByText(/successfully put on hold/i);
    });
  },
};

export const ErrorPath = {
  name: 'API Error',
  parameters: {
    mocks: [getCard, holdCardGenericError],
  },
  render: () => html`
    <feature-flow
      cardStatus="active"
      accountHolder="Jan de Vries"
      cardId="CARD-1234-5678-9012">
    </feature-flow>
  `,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Trigger error', async () => {
      await userEvent.click(await canvas.findByText('Hold Card'));
    });

    await step('Verify error screen', async () => {
      await canvas.findByText(/Something went wrong/i);
      await canvas.findByText(/Try Again/i);
    });
  },
};
```

---

## Story Patterns

### The Default Story (Interactive Playground)

The first exported story uses the default `args` from the meta. Engineers experiment with the component using the Controls panel.

### Outcome Variants (Visual Regression Targets)

Export explicit stories for every meaningful visual state. Each variant should boot directly into that state — no user interaction required.

```javascript
export const SessionExpired = {
  name: 'Session Expired (Non-retryable)',
  args: {
    errorTitle: 'Session expired',
    errorMessage: 'Please log in again.',
    retryable: false,
  },
};
```

**Why explicit variants?** QA tools (Chromatic, Playwright screenshot tests) capture each exported story as a snapshot. If a state only exists behind a button click, it won't be captured.

### Edge Case Stories

Every component should have edge case stories that test boundary conditions:

| Edge Case | What to Test |
|-----------|-------------|
| **Empty strings** | What happens when required text props are empty? |
| **Long text** | Does the component handle overflow, wrapping, and truncation? |
| **Loading state** | Is the button disabled? Is a spinner shown? |
| **Error state** | Does the component show error indicators? |
| **Missing props** | What renders when optional props are undefined? |
| **Max values** | For numeric props: what happens at boundaries? |

```javascript
// Name edge case stories with the "Edge:" prefix
export const EmptyMessage = {
  name: 'Edge: Empty Error Message',
  args: { errorTitle: 'Error', errorMessage: '' },
};

export const LongText = {
  name: 'Edge: Long Text Overflow',
  args: {
    errorTitle: 'A very long error title that might wrap...',
    errorMessage: 'Lorem ipsum dolor sit amet...',
  },
};
```

---

## Controls Panel

### Control Types Reference

| Prop Type | Control | argTypes Syntax |
|-----------|---------|----------------|
| `String` | Text input | `{ control: 'text' }` |
| `Boolean` | Checkbox | `{ control: 'boolean' }` |
| `Number` | Number input | `{ control: { type: 'number', min: 0, max: 100 } }` |
| `Enum (few)` | Radio | `{ control: { type: 'radio' }, options: ['a', 'b'] }` |
| `Enum (many)` | Select | `{ control: { type: 'select' }, options: [...] }` |
| `Color` | Color picker | `{ control: 'color' }` |
| `Object` | JSON editor | `{ control: 'object' }` |
| `Date` | Date picker | `{ control: 'date' }` |

### Categories

Group argTypes with `table.category` to organize the Controls panel:

```javascript
argTypes: {
  title:   { control: 'text', table: { category: 'Content' } },
  message: { control: 'text', table: { category: 'Content' } },
  isOpen:  { control: 'boolean', table: { category: 'State' } },
  onClose: { action: 'close', table: { category: 'Events' } },
}
```

Standard categories: `Content`, `State`, `Behavior`, `Appearance`, `Labels`, `Events`.

---

## Actions Panel

### Logging Events with `fn()`

Use `fn()` from `storybook/test` to create a spy that logs to the Actions panel AND can be asserted in `play()`:

```javascript
import { fn } from 'storybook/test';

export default {
  args: {
    onRetry: fn(),   // logs to Actions + assertable
    onDismiss: fn(), // logs to Actions + assertable
  },
  render: (args) => {
    const el = document.createElement('my-component');
    // Attach the spy to the actual DOM event
    el.addEventListener('retry', args.onRetry);
    el.addEventListener('dismiss', args.onDismiss);
    return el;
  },
};
```

**Important for Web Components:** React/Vue pass callbacks as props. LitElement dispatches CustomEvents. You must manually `addEventListener` in the `render()` function to bridge the gap.

---

## Interactions Panel

### Play Functions with `step()`

Use `play()` to simulate user interaction. Use `step()` to group actions — they appear as collapsible sections in the Interactions tab:

```javascript
import { fn, expect, within, userEvent } from 'storybook/test';

export const Default = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Verify initial state', async () => {
      await expect(canvas.getByText('Hold Card')).toBeInTheDocument();
    });

    await step('Click action button', async () => {
      await userEvent.click(canvas.getByText('Hold Card'));
    });

    await step('Verify event was fired', async () => {
      await expect(args.onAction).toHaveBeenCalledTimes(1);
    });
  },
};
```

### Common Assertions

```javascript
// Element exists
await expect(canvas.getByText('Hello')).toBeInTheDocument();

// Element does NOT exist
expect(canvas.queryByText('Missing')).not.toBeInTheDocument();

// Event was called
await expect(args.onAction).toHaveBeenCalled();
await expect(args.onAction).toHaveBeenCalledTimes(1);

// Wait for async content
const el = await canvas.findByText(/success/i); // waits up to 1s

// Text matching
await expect(canvas.getByText(/partial match/i)).toBeInTheDocument();
```

### Shadow DOM: Play Functions for Web Components

`canvas.getByText()` from `within(canvasElement)` only queries **light DOM**. LitElement renders into Shadow DOM, so these queries will fail for component content.

**Use a shadow query helper:**

```javascript
/** Helper: queries into the web component's Shadow DOM */
function getShadowContent(canvasElement) {
  const el = canvasElement.querySelector('my-component');
  const root = el?.shadowRoot;
  return { el, root, text: root?.textContent || '' };
}

export const Default = {
  play: async ({ args, canvasElement, step }) => {
    await step('Verify content renders', async () => {
      const { text } = getShadowContent(canvasElement);
      await expect(text).toContain('Expected text');
    });

    await step('Click button → verify event', async () => {
      const { root } = getShadowContent(canvasElement);
      root.querySelector('lion-button').click();
      await expect(args.onAction).toHaveBeenCalled();
    });
  },
};
```

**When can you use `canvas.getByText()` / `canvas.findByText()`?**
- Flow-level stories where `feature-flow` renders child elements that Storybook's testing library can traverse (the text is eventually rendered in the document)
- Use `findByText` (with `find`) for async content — it polls until the element appears

---

## Render Function: Web Component Gotchas

### Property Assignment (Correct)

```javascript
render: (args) => {
  const el = document.createElement('my-component');
  el.myTitle = args.myTitle;      // ✅ triggers LitElement setter
  el.isActive = args.isActive;    // ✅ boolean works correctly
  el.addEventListener('action', args.onAction);
  return el;
},
```

### HTML Attribute Binding (Incorrect for Controls)

```javascript
// ❌ DON'T — boolean attributes and Controls panel don't play well together
render: (args) => html`
  <my-component
    errorTitle="${args.errorTitle}"
    ?retryable="${args.retryable}"
  ></my-component>
`,
```

The HTML attribute approach works for static stories but **breaks the Controls panel** — changing a control won't re-render the component because Lit doesn't detect attribute changes from the outside.

---

## MDX Documentation Pages

Every component that appears in the Storybook sidebar should have a `.mdx` doc page. At minimum it covers:

1. **Purpose** — one sentence: what this component does
2. **When to use / when NOT to use** — prevent misuse
3. **Props table** — auto-generated from `argTypes` where possible
4. **Events** — name, payload shape, when it fires
5. **Slots** — name, purpose, default content

Keep prose short. If you need more than 3 paragraphs to explain a component, the component is probably too complex.
