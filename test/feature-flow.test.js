import { describe, it, expect, beforeEach } from 'vitest';
import '../src/feature-flow.js';
import { holdSuccessResponse, unholdSuccessResponse } from '../demo/mocks/scenarios.js';

function createMockService({ holdError, unholdError } = {}) {
  return {
    holdCard:   holdError   ? () => Promise.reject(holdError)   : () => Promise.resolve(holdSuccessResponse),
    unholdCard: unholdError ? () => Promise.reject(unholdError) : () => Promise.resolve(unholdSuccessResponse),
  };
}

function mount(html) {
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);
  return container.firstElementChild;
}

describe('feature-flow', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it('starts on the toggle screen', async () => {
    const el = mount('<feature-flow></feature-flow>');
    el.cardStatus = 'active';
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('holdcard-toggle-screen')).toBeTruthy();
    expect(el.shadowRoot.querySelector('status-success-screen')).toBeFalsy();
    expect(el.shadowRoot.querySelector('status-error-screen')).toBeFalsy();
  });

  it('transitions to success screen after successful hold', async () => {
    const el = mount('<feature-flow></feature-flow>');
    el.cardStatus = 'active';
    el.service = createMockService();
    await el.updateComplete;

    el.shadowRoot.querySelector('holdcard-toggle-screen')
      .dispatchEvent(new CustomEvent('action', { detail: { action: 'hold' }, bubbles: true, composed: true }));

    await new Promise((r) => setTimeout(r, 200));
    await el.updateComplete;
    await el.updateComplete;

    expect(el.shadowRoot.querySelector('status-success-screen')).toBeTruthy();
    expect(el.shadowRoot.querySelector('holdcard-toggle-screen')).toBeFalsy();
  });

  it('transitions to success screen after successful unhold', async () => {
    const el = mount('<feature-flow></feature-flow>');
    el.cardStatus = 'on-hold';
    el.service = createMockService();
    await el.updateComplete;

    el.shadowRoot.querySelector('holdcard-toggle-screen')
      .dispatchEvent(new CustomEvent('action', { detail: { action: 'unhold' }, bubbles: true, composed: true }));

    await new Promise((r) => setTimeout(r, 200));
    await el.updateComplete;
    await el.updateComplete;

    expect(el.shadowRoot.querySelector('status-success-screen')).toBeTruthy();
  });

  it('transitions to error screen when the API rejects', async () => {
    const el = mount('<feature-flow></feature-flow>');
    el.cardStatus = 'active';
    el.service = createMockService({ holdError: { errorCode: 'GENERIC_ERROR', retryable: true } });
    await el.updateComplete;

    el.shadowRoot.querySelector('holdcard-toggle-screen')
      .dispatchEvent(new CustomEvent('action', { detail: { action: 'hold' }, bubbles: true, composed: true }));

    await new Promise((r) => setTimeout(r, 200));
    await el.updateComplete;
    await el.updateComplete;

    expect(el.shadowRoot.querySelector('status-error-screen')).toBeTruthy();
  });

  it('returns to toggle screen after retry', async () => {
    const el = mount('<feature-flow></feature-flow>');
    el.cardStatus = 'active';
    el.service = createMockService({ holdError: { errorCode: 'GENERIC_ERROR', retryable: true } });
    await el.updateComplete;

    el.shadowRoot.querySelector('holdcard-toggle-screen')
      .dispatchEvent(new CustomEvent('action', { detail: { action: 'hold' }, bubbles: true, composed: true }));
    await new Promise((r) => setTimeout(r, 200));
    await el.updateComplete;
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('status-error-screen')).toBeTruthy();

    el.shadowRoot.querySelector('status-error-screen')
      .dispatchEvent(new CustomEvent('retry', { bubbles: true, composed: true }));
    await new Promise((r) => setTimeout(r, 50));
    await el.updateComplete;

    expect(el.shadowRoot.querySelector('holdcard-toggle-screen')).toBeTruthy();
  });
});
