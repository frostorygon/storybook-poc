import { describe, it, expect, beforeEach } from 'vitest';
import { HoldcardToggleScreen } from './holdcard-toggle-screen.js';

customElements.define('holdcard-toggle-screen', HoldcardToggleScreen);

function mount(html) {
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);
  return container.firstElementChild;
}

describe('holdcard-toggle-screen — rendering', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it('shows loading state when isLoading is set', async () => {
    const el = mount('<holdcard-toggle-screen></holdcard-toggle-screen>');
    el.isLoading = true;
    await el.updateComplete;
    expect(el.shadowRoot.textContent).toContain('Loading card details');
  });

  it('renders ACTIVE badge when cardStatus is active', async () => {
    const el = mount('<holdcard-toggle-screen></holdcard-toggle-screen>');
    el.cardStatus = 'active';
    el.accountHolder = 'Jan de Vries';
    await el.updateComplete;
    const badge = el.shadowRoot.querySelector('.card-status');
    expect(badge.textContent.trim()).toBe('Active');
    expect(badge.classList.contains('status-active')).toBe(true);
  });

  it('renders ON HOLD badge when cardStatus is on-hold', async () => {
    const el = mount('<holdcard-toggle-screen></holdcard-toggle-screen>');
    el.cardStatus = 'on-hold';
    await el.updateComplete;
    const badge = el.shadowRoot.querySelector('.card-status');
    expect(badge.textContent.trim()).toBe('On Hold');
    expect(badge.classList.contains('status-hold')).toBe(true);
  });

  it('shows accountHolder name', async () => {
    const el = mount('<holdcard-toggle-screen></holdcard-toggle-screen>');
    el.cardStatus = 'active';
    el.accountHolder = 'Jan de Vries';
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('h2').textContent).toBe('Jan de Vries');
  });

  it('shows "Customer" fallback when accountHolder is not set', async () => {
    const el = mount('<holdcard-toggle-screen></holdcard-toggle-screen>');
    el.cardStatus = 'active';
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('h2').textContent).toBe('Customer');
  });

  it('applies human-readable aria-label to masked number', async () => {
    const el = mount('<holdcard-toggle-screen></holdcard-toggle-screen>');
    el.cardStatus = 'active';
    el.maskedNumber = '**** **** **** 4567';
    await el.updateComplete;
    const maskedEl = el.shadowRoot.querySelector('.masked-number');
    expect(maskedEl.getAttribute('aria-label')).toBe('Card ending in 4567');
  });
});

describe('holdcard-toggle-screen — events', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it('emits action:hold when card is active and button is clicked', async () => {
    const el = mount('<holdcard-toggle-screen></holdcard-toggle-screen>');
    el.cardStatus = 'active';
    await el.updateComplete;
    let emitted = null;
    el.addEventListener('action', (e) => { emitted = e.detail; });
    el.shadowRoot.querySelector('lion-button').click();
    expect(emitted).toEqual({ action: 'hold' });
  });

  it('emits action:unhold when card is on-hold and button is clicked', async () => {
    const el = mount('<holdcard-toggle-screen></holdcard-toggle-screen>');
    el.cardStatus = 'on-hold';
    await el.updateComplete;
    let emitted = null;
    el.addEventListener('action', (e) => { emitted = e.detail; });
    el.shadowRoot.querySelector('lion-button').click();
    expect(emitted).toEqual({ action: 'unhold' });
  });
});
