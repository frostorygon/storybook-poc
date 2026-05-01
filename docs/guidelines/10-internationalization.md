# Internationalization (i18n)

All user-facing strings pass through a translation layer. No hardcoded text in templates.

## Strategy: Lion `LocalizeMixin`

This codebase uses Lion's `LocalizeMixin` for translations. The mixin provides namespaced translations, lifecycle hooks for locale changes, and automatic render blocking until translations load.

**Why not `@lit/localize`?** The `@lit/localize` package wraps template literals with `msg()` at the call site, which conflicts with our extracted `template(host)` pattern. It also requires a build-time CLI extraction step. Lion's `LocalizeMixin` works at runtime and feeds translations through the host — same data-down pattern as everything else.

---

## How It Works

### 1. Component declares its namespace

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

### 2. Translation files export a flat object

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

### 3. Template reads via `msgLit` prop

The component's `render()` passes `this.msgLit` as a prop to the template:

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

```javascript
// holdcard-toggle-screen.template.js
export function template({ cardStatus, msgLit, onAction }) {
  return html`
    <h2>${msgLit('holdcard-toggle:title')}</h2>
    <p>${msgLit('holdcard-toggle:description')}</p>
    <lion-button @click="${onAction}">
      ${cardStatus === 'active'
        ? msgLit('holdcard-toggle:holdButton')
        : msgLit('holdcard-toggle:unholdButton')}
    </lion-button>
  `;
}
```

The template stays a pure function — it doesn't import the localization system directly.

---

## Namespace Conventions

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

## Lifecycle Hooks

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

## Changing the Locale

```javascript
import { localize } from '@lion/ui/localize.js';

// Set locale globally — all components re-render automatically
localize.locale = 'nl-NL';
```

This also updates `document.documentElement.lang` for screen reader compatibility (see [08-accessibility.md](./08-accessibility.md)).

---

## What NOT to Localize

| Category | Localize? | Why |
|----------|----------|-----|
| User-facing labels, titles, descriptions | ✅ Yes | Users see them |
| Error messages shown to users | ✅ Yes | Users see them |
| `errorCode` values (e.g., `'SESSION_EXPIRED'`) | ❌ No | Machine-readable, used in switch/if logic |
| Console logs and developer messages | ❌ No | Developers read English |
| Design token names | ❌ No | CSS variables are code |

---

## Testing Translations

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
