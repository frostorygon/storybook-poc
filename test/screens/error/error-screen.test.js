import { describe, it, expect, beforeEach } from 'vitest';
import { ErrorScreen } from '../../../src/screens/error/error-screen.js';

// Register locally for standalone testing
if (!customElements.get('error-screen')) {
  customElements.define('error-screen', ErrorScreen);
}

function mount(html) {
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);
  return container.firstElementChild;
}

describe('ErrorScreen', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it('renders SomethingWentWrong variant by default', async () => {
    const el = mount('<error-screen></error-screen>');
    await el.updateComplete;

    // Text is in the shell's shadow DOM (error-screen → status-error-screen)
    const shell = el.shadowRoot.querySelector('status-error-screen');
    await shell?.updateComplete;
    const text = shell?.shadowRoot?.textContent || el.shadowRoot.textContent;
    expect(text).toContain('Something went wrong');
  });

  it('renders Timeout variant', async () => {
    const el = mount('<error-screen error-type="Timeout"></error-screen>');
    await el.updateComplete;

    const shell = el.shadowRoot.querySelector('status-error-screen');
    await shell?.updateComplete;
    const text = shell?.shadowRoot?.textContent || el.shadowRoot.textContent;
    expect(text).toContain('Request timed out');
  });

  it('renders SessionExpired variant', async () => {
    const el = mount('<error-screen error-type="SessionExpired"></error-screen>');
    await el.updateComplete;

    const shadowContent = el.shadowRoot.textContent;
    expect(shadowContent).toContain('Session expired');
    expect(shadowContent).toContain('log in again');
  });

  it('dispatches retry event for retryable errors', async () => {
    const el = mount('<error-screen error-type="SomethingWentWrong"></error-screen>');
    await el.updateComplete;

    let fired = false;
    el.addEventListener('retry', () => { fired = true; });

    // Trigger the retry handler directly (shell button bubbles through)
    el._onRetry();

    expect(fired).toBe(true);
  });

  it('dispatches auth-redirect event for SessionExpired', async () => {
    const el = mount('<error-screen error-type="SessionExpired"></error-screen>');
    await el.updateComplete;

    let fired = false;
    el.addEventListener('auth-redirect', () => { fired = true; });

    el._onAuthRedirect();

    expect(fired).toBe(true);
  });
});
