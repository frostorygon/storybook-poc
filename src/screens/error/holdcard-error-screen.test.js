import { describe, it, expect, beforeEach } from 'vitest';
import './holdcard-error-screen.js';
import { genericError } from './fixtures/generic.js';
import { sessionExpiredError } from './fixtures/session-expired.js';

function mount(html) {
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);
  return container.firstElementChild;
}

describe('holdcard-error-screen', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it('renders errorTitle and errorMessage', async () => {
    const el = mount('<holdcard-error-screen></holdcard-error-screen>');
    el.errorContext = genericError;
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('h2').textContent).toBe('Something went wrong');
    expect(el.shadowRoot.querySelector('p').textContent).toContain("couldn't process");
  });

  it('shows "Try Again" button when retryable is true', async () => {
    const el = mount('<holdcard-error-screen></holdcard-error-screen>');
    el.errorContext = genericError;
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('lion-button').textContent.trim()).toBe('Try Again');
  });

  it('shows "Back to overview" button when retryable is false', async () => {
    const el = mount('<holdcard-error-screen></holdcard-error-screen>');
    el.errorContext = sessionExpiredError;
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('lion-button').textContent.trim()).toBe('Back to overview');
  });

  it('renders fallback (not blank) when errorContext is null', async () => {
    const el = mount('<holdcard-error-screen></holdcard-error-screen>');
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('h2').textContent).toContain('unexpected error');
  });

  it('dispatches retry event when "Try Again" is clicked', async () => {
    const el = mount('<holdcard-error-screen></holdcard-error-screen>');
    el.errorContext = genericError;
    await el.updateComplete;
    let fired = false;
    el.addEventListener('retry', () => { fired = true; });
    el.shadowRoot.querySelector('lion-button').click();
    expect(fired).toBe(true);
  });
});
