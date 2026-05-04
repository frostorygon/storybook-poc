# Accessibility & Internationalization

WCAG 2.2 AA compliance is mandatory. All user-facing strings pass through a translation layer. Shadow DOM introduces specific challenges for both — screen readers, focus management, and locale-aware rendering all need explicit handling.

---

## Part 1: Accessibility (a11y)

### Semantic HTML

Use native elements inside Shadow DOM. Screen readers understand `<button>`, not `<div class="button">`.

| Instead of | Use |
|-----------|-----|
| `<div class="button" @click>` | `<button @click>` or `<lion-button>` |
| `<div class="heading">` | `<h1>`, `<h2>`, etc. |
| `<div class="list">` | `<ul>`, `<ol>` |
| Generic container | `<section>`, `<article>`, `<nav>`, `<main>` |

**Exception:** Lion Web Components (e.g., `<lion-button>`) handle ARIA roles internally. When using Lion, trust its built-in accessibility and don't double up on `role` attributes.

---

### Live Regions & Screen Reader Announcements

When the UI changes without a page reload (screen transitions, error messages, loading states), screen readers need to be told.

#### Error and success screens

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

### Focus Management During Screen Transitions

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

### Masked and Sensitive Data

When displaying masked card numbers or account details, provide an `aria-label` that screen readers can announce clearly:

```html
<span
  class="masked-number"
  aria-label="Card ending in 4 5 6 7">
  **** **** **** 4567
</span>
```

Without this, screen readers may announce "asterisk asterisk asterisk asterisk" — unhelpful and confusing.

---

### Form Accessibility

Lion form components (`lion-input`, `lion-form`, `lion-select`) implement the `ElementInternals` API. They behave like native form controls for:
- Focus and tab order
- Label association (`for` / `aria-labelledby`)
- Built-in validation and error announcements
- Form submission data

**Rule:** Use Lion form components instead of raw `<input>` elements. They handle `aria-describedby`, `aria-invalid`, and validation messaging out of the box.

---

### Color Contrast

Design tokens in `tokens.js` must meet WCAG AA contrast ratios:

| Context | Minimum ratio |
|---------|--------------|
| Normal text (< 18px) | 4.5:1 |
| Large text (≥ 18px bold or ≥ 24px) | 3:1 |
| UI components and icons | 3:1 |

Test with browser DevTools (Accessibility panel → Contrast ratio) or the Storybook a11y addon (`@storybook/addon-a11y`), which is already configured in this project.

---

### Reduced Motion

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

## Part 2: Internationalization (i18n)

All user-facing strings pass through a translation layer. No hardcoded text in templates.

### Strategy: Lion `LocalizeMixin`

This codebase uses Lion's `LocalizeMixin` for translations. The mixin provides namespaced translations, lifecycle hooks for locale changes, and automatic render blocking until translations load.

**Why not `@lit/localize`?** The `@lit/localize` package wraps template literals with `msg()` at the call site, which conflicts with our extracted `template(host)` pattern. It also requires a build-time CLI extraction step. Lion's `LocalizeMixin` works at runtime and feeds translations through the host — same data-down pattern as everything else.

---

### How It Works

#### 1. Component declares its namespace

```javascript
import { LocalizeMixin } from '@lion/ui/localize-no-side-effects.js';

class HoldcardToggleScreen extends LocalizeMixin(ScopedElementsMixin(LitElement)) {
  static get localizeNamespaces() {
    return [
      { 'holdcard-toggle': locale => import(`./translations/${locale}.js`) },
      ...super.localizeNamespaces,
    ];
  }
}
```

#### 2. Translation files export a flat object

```javascript
// translations/en-GB.js
export default {
  title: 'Temporary Card Hold',
  description: 'Freeze your card to prevent new transactions.',
  holdButton: 'Hold Card',
  unholdButton: 'Unhold Card',
};
```

```javascript
// translations/nl-NL.js
export default {
  title: 'Tijdelijke Kaartvergrendeling',
  description: 'Blokkeer je kaart om nieuwe transacties te voorkomen.',
  holdButton: 'Kaart blokkeren',
  unholdButton: 'Kaart deblokkeren',
};
```

#### 3. Template reads via `msgLit` prop

The component's `render()` passes `this.msgLit` as a prop to the template. The template never imports the localization system directly — see [03-template-patterns.md](./03-template-patterns.md) for the template pattern.

```javascript
// holdcard-toggle-screen.js — render()
render() {
  return template({
    cardStatus: this.cardStatus,
    msgLit: (key) => this.msgLit(key),
    onAction: () => this._onAction(),
  });
}
```

---

### Namespace Conventions

| Component | Namespace | Translation path |
|-----------|-----------|-----------------|
| `holdcard-toggle-screen` | `holdcard-toggle` | `screens/toggle/translations/{locale}.js` |
| `status-error-screen` | `status-error` | `components/screens/status-error-screen/translations/{locale}.js` |
| `feature-flow` | `feature-flow` | `translations/{locale}.js` |

**Rules:**
- One namespace per component. Never share namespaces between components.
- Namespace names match the component name (without `-screen` suffix for brevity).
- Translation files are colocated in a `translations/` subfolder within the component directory.

---

### Translation Key Naming

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

---

### Lifecycle Hooks

`LocalizeMixin` provides three lifecycle callbacks:

```javascript
onLocaleReady() {
  super.onLocaleReady();
  // Translations loaded for initial locale.
  // Safe to access this.msgLit() here.
}

onLocaleChanged() {
  super.onLocaleChanged();
  // User switched locale. New translations loaded.
}

onLocaleUpdated() {
  super.onLocaleUpdated();
  // Called after both onLocaleReady and onLocaleChanged.
  // Use for DOM updates that can't be handled declaratively.
}
```

By default, the component won't render until its namespace is loaded (`waitForLocalizeNamespaces = true`). Set it to `false` if you need to render a loading skeleton while translations load.

---

### Changing the Locale

```javascript
import { localize } from '@lion/ui/localize.js';

// Set locale globally — all components re-render automatically
localize.locale = 'nl-NL';
```

This also updates `document.documentElement.lang` for screen reader compatibility (see the Language Attribute section above).

---

### What NOT to Localize

| Category | Localize? | Why |
|----------|----------|-----|
| User-facing labels, titles, descriptions | ✅ Yes | Users see them |
| Error messages shown to users | ✅ Yes | Users see them |
| `errorCode` values (e.g., `'SESSION_EXPIRED'`) | ❌ No | Machine-readable, used in switch/if logic |
| Console logs and developer messages | ❌ No | Developers read English |
| Design token names | ❌ No | CSS variables are code |

---

### Testing Translations

Test that translation keys resolve correctly by loading the namespace in the test:

```javascript
import { localize } from '@lion/ui/localize.js';

it('displays localized title', async () => {
  localize.locale = 'en-GB';
  const el = mount('<holdcard-toggle-screen></holdcard-toggle-screen>');
  await el.localizeNamespacesLoaded;
  await el.updateComplete;

  expect(el.shadowRoot.querySelector('h2').textContent).toBe('Temporary Card Hold');
});
```

To test a different locale:

```javascript
it('displays Dutch title', async () => {
  localize.locale = 'nl-NL';
  const el = mount('<holdcard-toggle-screen></holdcard-toggle-screen>');
  await el.localizeNamespacesLoaded;
  await el.updateComplete;

  expect(el.shadowRoot.querySelector('h2').textContent).toBe('Tijdelijke Kaartvergrendeling');
});
```

---

### Language Attribute

When the application locale changes, the `lang` attribute on `<html>` must be updated to match. Screen readers use this to select the correct pronunciation engine.

```javascript
document.documentElement.lang = newLocale;  // e.g., 'nl-NL'
```

Lion's `LocalizeMixin` handles this automatically when using `localize.locale`.
