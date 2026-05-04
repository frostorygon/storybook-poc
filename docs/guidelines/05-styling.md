# Styling & CSS Standards

All styles live in Shadow DOM. Global CSS cannot reach component internals. Theming works through CSS custom properties (design tokens) that pierce the shadow boundary by design.

## File Structure

Every component extracts its styles into `[name].styles.js`:

```javascript
// status-error-screen.styles.js
import { css } from 'lit';
import { colorTokens } from '../../../tokens.js';

export const styles = [
  colorTokens,
  css`
    :host {
      display: block;
    }
    .error-icon {
      color: var(--color-error, #d32f2f);
    }
  `,
];
```

**Why an array?** Lit accepts an array of `CSSResult` objects. This lets you compose shared token sheets with component-specific styles without string concatenation.

---

## Design Tokens

Shared tokens live in `src/tokens.js` and are imported into component style files. They define CSS custom properties that the consuming application can override.

```javascript
// tokens.js
export const colorTokens = css`
  :host {
    --color-brand:      #ff6200;
    --color-active:     #2e7d32;
    --color-active-bg:  #e8f5e9;
    --color-hold:       #c62828;
    --color-hold-bg:    #ffebee;
    --color-text-muted: #666666;
    --color-surface:    #ffffff;
    --color-bg:         #f5f5f5;
  }
`;
```

Consumers override these at the application level:
```css
feature-flow {
  --color-brand: #004990;  /* ING blue instead of orange */
}
```

---

## `:host` Patterns

Custom elements default to `display: inline`. Always set an explicit display mode.

```css
/* Basic — every component needs this */
:host { display: block; }

/* Conditional — style based on attribute presence */
:host([disabled]) { opacity: 0.5; pointer-events: none; }
:host([hidden]) { display: none; }

/* Context-aware (use sparingly) */
:host-context(.dark-theme) { --color-bg: #1a1a1a; }
```

**When to use `:host-context()`:** Almost never. It couples the component to an ancestor's class name. Prefer CSS custom properties for theming. `:host-context()` is acceptable for gross layout shifts (e.g., RTL support) where custom properties aren't enough.

---

## Theming Rules

| Do | Don't |
|----|-------|
| Use `var(--token, fallback)` with a sensible fallback | Hardcode colors: `color: #ff6200` |
| Define tokens in `tokens.js` and import them | Scatter `--custom-prop` definitions across style files |
| Use semantic names: `--color-error`, `--color-brand` | Use implementation names: `--red`, `--orange-primary` |
| Use the style array pattern: `[colorTokens, css\`...\`]` | Import tokens inside `css` strings (not possible) |

---

## `::part()` — The Escape Hatch

When CSS custom properties aren't enough, expose internal elements via the `part` attribute:

```javascript
// In the component template
html`<button part="action-button">${label}</button>`;
```

```css
/* Consumer can now style it */
my-component::part(action-button) {
  border-radius: 0;
}
```

**When to use `::part()`:** When a consumer needs to change a structural CSS property (border-radius, padding, display) that can't be expressed as a design token. Document every exposed part in the component's `.mdx` file.

**Anti-pattern — Exposing everything:**
```html
<!-- DON'T — if you part everything, you've effectively removed encapsulation -->
<div part="wrapper">
  <h2 part="title">...</h2>
  <p part="desc">...</p>
  <button part="btn">...</button>
</div>
```

Keep exposed parts to a minimum. If consumers need full control, they should compose with slots instead.
