# Open-WC Alignment

This project is built on [open-wc](https://open-wc.org/) recommendations. This document tracks what we follow, what we consciously trade off, and what should be adopted when moving to production.

---

## What We Follow

### Buildless Development

> *"Browsers have improved a lot. It's now possible to do web development without requiring complex build tooling, using the native module loader of the browser."*
> — [Going Buildless](https://open-wc.org/guides/developing-components/going-buildless/)

We use `@web/storybook-builder` which runs `@web/dev-server` under the hood. No Webpack, no Vite bundling. Code runs natively in the browser during development. Bare module imports are resolved by `@web/dev-server` with `--node-resolve`.

### Lit as Base Library

> *"Our generator sets you up with a component built with Lit as base library. We recommend this as a general starting point."*
> — [Getting Started](https://open-wc.org/guides/developing-components/getting-started/)

All components extend `LitElement` from [Lit](https://lit.dev/).

### Scoped Custom Element Registry

We use `@open-wc/scoped-elements` to avoid global custom element name collisions. Components do **not** call `customElements.define()` themselves — `ScopedElementsMixin` in the parent handles scoped registration.

- **Docs:** [Scoped Elements](https://open-wc.org/docs/development/scoped-elements/)
- **Polyfill:** `@webcomponents/scoped-custom-element-registry`

### Testing: Side-Effects Over Stubs

> *"Instead of testing the function has been called, test the side-effects of that function (e.g.: it fires an event, a property has now been set)."*
> — [Testing Stubs](https://open-wc.org/guides/knowledge/testing/stubs/)

Our tests verify DOM output and fired events, not internal method calls. See [07-testing-standards.md](./07-testing-standards.md) for the full test strategy.

### Demo Folder Convention

Open-wc uses `demo/` as the development entry point (`demo/index.html`). We extend this pattern — our `demo/mocks/` folder holds the centralized mock layer that feeds both Storybook and tests. See [11-mocking-strategy.md](./11-mocking-strategy.md) for details.

---

## Gaps — Conscious Trade-offs (POC Only)

These exist because this is a proof-of-concept focused on the mocking architecture. Production repos should address them.

### Test Runner: Vitest vs `@web/test-runner`

| | This POC | Open-WC Standard |
|---|---|---|
| **Runner** | Vitest (browser mode, Playwright) | [`@web/test-runner`](https://modern-web.dev/docs/test-runner/overview/) |
| **Assertion lib** | Vitest `expect` | [`@open-wc/testing`](https://open-wc.org/docs/testing/testing-package/) (Chai + helpers) |
| **Fixture helper** | Manual `mount()` function | [`fixture()`](https://open-wc.org/docs/testing/helpers/#test-fixtures) from `@open-wc/testing` |

**Why Vitest for the POC:** Faster iteration, familiar API, and it proves that the mock architecture (`demo/mocks/scenarios.js`) is test-runner agnostic — the same imports work with any runner.

**Migration to production:**

1. Replace `vitest` with `@web/test-runner` in `devDependencies`
2. Replace `vitest.config.js` with `web-test-runner.config.mjs`
3. Replace manual `mount()` with `fixture()` from `@open-wc/testing`:

```javascript
// Before (Vitest + manual mount)
import { describe, it, expect } from 'vitest';
function mount(html) { /* manual DOM insertion */ }
const el = mount('<my-component></my-component>');

// After (@open-wc/testing)
import { fixture, expect, html } from '@open-wc/testing';
const el = await fixture(html`<my-component></my-component>`);
```

4. **Mock imports stay identical** — no changes to `demo/mocks/`

#### Why `fixture()` is better than `mount()`

- Auto-cleanup: removes elements after each test (no `beforeEach` cleanup)
- Awaits `updateComplete` automatically
- Works with `@open-wc/testing` assertion extensions (`.shadowDom.to.equal(...)`)
- Part of the standard — new engineers won't need to learn a custom helper

**Links:**
- [Web Test Runner Overview](https://modern-web.dev/docs/test-runner/overview/)
- [Testing Helpers (fixture, waitUntil, oneEvent)](https://open-wc.org/docs/testing/helpers/)
- [Testing Package](https://open-wc.org/docs/testing/testing-package/)

---

### Semantic DOM Diff

Open-wc provides `@open-wc/semantic-dom-diff` for snapshot testing Shadow DOM output. This catches unintentional structural changes that unit assertions might miss.

```javascript
import { expect, fixture, html } from '@open-wc/testing';

it('renders correctly', async () => {
  const el = await fixture(html`<my-component></my-component>`);
  expect(el).shadowDom.to.equalSnapshot();
});
```

Not used in this POC — add it when migrating to `@web/test-runner`.

**Link:** [Semantic DOM Diff](https://open-wc.org/docs/testing/semantic-dom-diff/)

---

### Accessibility Testing (chai-a11y-axe)

We have `@storybook/addon-a11y` for visual a11y checks in Storybook. Open-wc also recommends automated a11y assertions in unit tests via `chai-a11y-axe`:

```javascript
import { expect, fixture, html } from '@open-wc/testing';

it('passes a11y audit', async () => {
  const el = await fixture(html`<my-component></my-component>`);
  await expect(el).to.be.accessible();
});
```

This runs [axe-core](https://github.com/dequelabs/axe-core) against each component and catches issues like missing alt text, insufficient contrast, and invalid ARIA roles.

**Link:** [Chai A11y aXe](https://open-wc.org/docs/testing/chai-a11y-axe/)

---

### Linting: `eslint-plugin-lit-a11y`

Open-wc provides an ESLint plugin for accessibility rules specific to Lit templates. Key rules include:

| Rule | What it catches |
|---|---|
| `alt-text` | Missing alt attributes on images |
| `click-events-have-key-events` | Click handlers without keyboard alternatives |
| `aria-role` | Invalid ARIA role values |
| `no-autofocus` | Autofocus usage that harms a11y |
| `tabindex-no-positive` | Positive tabindex values that break tab order |

This POC doesn't configure ESLint — the org has `eslint-config-ow` which wraps these rules. Ensure it's included when setting up a production repo.

**Link:** [ESLint Plugin Lit A11y](https://open-wc.org/docs/linting/eslint-plugin-lit-a11y/overview/)

---

## Open-WC Reference

| Topic | Link |
|---|---|
| Getting Started | [open-wc.org/guides/.../getting-started](https://open-wc.org/guides/developing-components/getting-started/) |
| Going Buildless | [open-wc.org/guides/.../going-buildless](https://open-wc.org/guides/developing-components/going-buildless/) |
| Testing Guide | [open-wc.org/guides/.../testing](https://open-wc.org/guides/developing-components/testing/) |
| Testing Helpers | [open-wc.org/docs/testing/helpers](https://open-wc.org/docs/testing/helpers/) |
| Stubs & Mocking | [open-wc.org/guides/.../testing/stubs](https://open-wc.org/guides/knowledge/testing/stubs/) |
| Testing Events | [open-wc.org/guides/.../testing/events](https://open-wc.org/guides/knowledge/testing/events/) |
| Test Initialization | [open-wc.org/guides/.../testing/initialization](https://open-wc.org/guides/knowledge/testing/initialization/) |
| Scoped Elements | [open-wc.org/docs/.../scoped-elements](https://open-wc.org/docs/development/scoped-elements/) |
| Demoing (Storybook) | [open-wc.org/docs/demoing/storybook](https://open-wc.org/docs/demoing/storybook/) |
| Publishing | [open-wc.org/guides/.../publishing](https://open-wc.org/guides/developing-components/publishing/) |
| LitElement Lifecycle | [open-wc.org/guides/.../lifecycle](https://open-wc.org/guides/knowledge/lit-element/lifecycle/) |
| Modern Web | [modern-web.dev](https://modern-web.dev/) |
