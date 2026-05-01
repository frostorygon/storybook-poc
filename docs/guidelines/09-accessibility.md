# Accessibility (a11y)

WCAG 2.2 AA compliance is mandatory. Shadow DOM introduces specific challenges — screen readers, focus management, and keyboard navigation all need explicit handling that "just works" in light DOM.

## Semantic HTML

Use native elements inside Shadow DOM. Screen readers understand `<button>`, not `<div class="button">`.

| Instead of | Use |
|-----------|-----|
| `<div class="button" @click>` | `<button @click>` or `<lion-button>` |
| `<div class="heading">` | `<h1>`, `<h2>`, etc. |
| `<div class="list">` | `<ul>`, `<ol>` |
| Generic container | `<section>`, `<article>`, `<nav>`, `<main>` |

**Exception:** Lion Web Components (e.g., `<lion-button>`) handle ARIA roles internally. When using Lion, trust its built-in accessibility and don't double up on `role` attributes.

---

## Live Regions & Screen Reader Announcements

When the UI changes without a page reload (screen transitions, error messages, loading states), screen readers need to be told.

### Error and success screens

Use `role="alert"` on the container. This triggers an immediate announcement.

```html
<div class="status-container" role="alert">
  <h2>${host.errorTitle}</h2>
  <p>${host.errorMessage}</p>
</div>
```

**When NOT to use `role="alert"`:** Loading indicators, progress bars, or any state that updates frequently. Use `aria-live="polite"` instead — it waits for the screen reader to finish its current announcement before interrupting.

```html
<div class="loading" aria-live="polite" aria-busy="true">
  Processing your request...
</div>
```

---

## Focus Management During Screen Transitions

When the orchestrator transitions between screens (toggle → success, toggle → error), keyboard focus is lost. The user's focus drops to `<body>`, forcing them to tab through the entire page again.

Fix this by programmatically moving focus to the new screen's primary heading:

```javascript
async _transitionToSuccess() {
  this._currentStep = 'success';
  await this.updateComplete;

  const screen = this.shadowRoot.querySelector('status-success-screen');
  const heading = screen?.shadowRoot?.querySelector('h2');
  if (heading) {
    heading.setAttribute('tabindex', '-1');  // focusable but not in tab order
    heading.focus();
  }
}
```

**Rule:** Any component that swaps screens must manage focus. This includes `feature-flow` and any future multi-step wizards.

---

## Masked and Sensitive Data

When displaying masked card numbers or account details, provide a `aria-label` that screen readers can announce clearly:

```html
<span
  class="masked-number"
  aria-label="Card ending in 4 5 6 7">
  **** **** **** 4567
</span>
```

Without this, screen readers may announce "asterisk asterisk asterisk asterisk" — unhelpful and confusing.

---

## Form Accessibility

Lion form components (`lion-input`, `lion-form`, `lion-select`) implement the `ElementInternals` API. They behave like native form controls for:
- Focus and tab order
- Label association (`for` / `aria-labelledby`)
- Built-in validation and error announcements
- Form submission data

**Rule:** Use Lion form components instead of raw `<input>` elements. They handle `aria-describedby`, `aria-invalid`, and validation messaging out of the box.

---

## Color Contrast

Design tokens in `tokens.js` must meet WCAG AA contrast ratios:

| Context | Minimum ratio |
|---------|--------------|
| Normal text (< 18px) | 4.5:1 |
| Large text (≥ 18px bold or ≥ 24px) | 3:1 |
| UI components and icons | 3:1 |

Test with browser DevTools (Accessibility panel → Contrast ratio) or the Storybook a11y addon (`@storybook/addon-a11y`), which is already configured in this project.

---

## Reduced Motion

Respect `prefers-reduced-motion` for any animations or transitions:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

Place this in `tokens.js` or in component style files that contain animations.

---

## Language Attribute

When the application locale changes (see [09-internationalization.md](./09-internationalization.md)), the `lang` attribute on `<html>` must be updated to match. Screen readers use this to select the correct pronunciation engine.

```javascript
document.documentElement.lang = newLocale;  // e.g., 'nl-NL'
```

Lion's `LocalizeMixin` handles this automatically when using `localize.locale`.
