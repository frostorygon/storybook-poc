import { describe, it, expect, beforeEach } from 'vitest';
import { SessionExpiredErrorScreen } from '../../../../src/screens/error/session-expired/session-expired-error-screen.js';

// Register locally for standalone testing — in production this is scoped via FeatureFlow
customElements.define('session-expired-error-screen', SessionExpiredErrorScreen);

function mount(html) {
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);
  return container.firstElementChild;
}

describe('SessionExpiredErrorScreen', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it('renders the session expired text', async () => {
    const el = mount('<session-expired-error-screen></session-expired-error-screen>');
    await el.updateComplete;

    // The template slots content into status-error-screen's shadow DOM
    const shadowContent = el.shadowRoot.textContent;
    expect(shadowContent).toContain('Session expired');
    expect(shadowContent).toContain('log in again');
  });

  it('dispatches auth-redirect event when login button is clicked', async () => {
    const el = mount('<session-expired-error-screen></session-expired-error-screen>');
    await el.updateComplete;

    let fired = false;
    el.addEventListener('auth-redirect', () => { fired = true; });

    // The lion-button is rendered inside the shadow DOM
    const btn = el.shadowRoot.querySelector('lion-button');
    btn?.click();

    expect(fired).toBe(true);
  });
});
