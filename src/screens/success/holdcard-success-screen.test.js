import { describe, it, expect, beforeEach } from 'vitest';
import './holdcard-success-screen.js';

function mount(html) {
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);
  return container.firstElementChild;
}

describe('holdcard-success-screen', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it('shows "put on hold" copy when transactionType is "held"', async () => {
    const el = mount('<holdcard-success-screen></holdcard-success-screen>');
    el.transactionType = 'held';
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('h2').textContent).toContain('put on hold');
    expect(el.shadowRoot.querySelector('p').textContent).toContain('frozen');
  });

  it('shows "reactivated" copy when transactionType is "unheld"', async () => {
    const el = mount('<holdcard-success-screen></holdcard-success-screen>');
    el.transactionType = 'unheld';
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('h2').textContent).toContain('reactivated');
    expect(el.shadowRoot.querySelector('p').textContent).toContain('active');
  });
});
