/**
 * Flow Scenarios — Temporary Holdcard
 *
 * ✅ Hold Card — user holds an active card successfully
 * ✅ Unhold Card — user unholds a held card successfully
 * ✅ API Unavailable → Error — backend is down
 * ✅ Session Expired → Error — token expires mid-flow
 * ✅ Network Timeout → Error — slow network / gateway timeout
 */

import { html } from 'lit';
import { within, userEvent, expect } from '@storybook/test';
import './feature-flow.js';

/**
 * Creates a mock service matching HoldcardService's interface.
 * Same pattern used in vitest — no test infrastructure in production code.
 *
 * @param {{ holdError?: import('./types.js').ErrorContext, unholdError?: import('./types.js').ErrorContext }} [opts]
 */
function createMockService({ holdError, unholdError } = {}) {
  return {
    holdCard:   holdError   ? () => Promise.reject(holdError)   : () => Promise.resolve({ transactionType: 'held' }),
    unholdCard: unholdError ? () => Promise.reject(unholdError) : () => Promise.resolve({ transactionType: 'unheld' }),
  };
}

export default {
  title: 'Flows / Scenarios',
};

export const HoldCard = {
  name: 'Hold Card',
  render: () => {
    const el = document.createElement('feature-flow');
    el.setAttribute('cardStatus', 'active');
    el.setAttribute('accountHolder', 'Jan de Vries');
    el.setAttribute('cardId', 'CARD-1234-5678-9012');
    el.service = createMockService();
    return el;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const btn = await canvas.findByText('Hold Card');
    await userEvent.click(btn);
    await canvas.findByText(/Card successfully put on hold/i);
  },
};

export const UnholdCard = {
  name: 'Unhold Card',
  render: () => {
    const el = document.createElement('feature-flow');
    el.setAttribute('cardStatus', 'on-hold');
    el.setAttribute('accountHolder', 'Jan de Vries');
    el.setAttribute('cardId', 'CARD-1234-5678-9012');
    el.service = createMockService();
    return el;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const btn = await canvas.findByText('Unhold Card');
    await userEvent.click(btn);
    await canvas.findByText(/reactivated/i);
  },
};

export const APIUnavailableError = {
  name: 'API Unavailable → Error',
  render: () => {
    const el = document.createElement('feature-flow');
    el.setAttribute('cardStatus', 'active');
    el.setAttribute('accountHolder', 'Jan de Vries');
    el.service = createMockService({ holdError: { errorCode: 'GENERIC_ERROR', retryable: true } });
    return el;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const btn = await canvas.findByText('Hold Card');
    await userEvent.click(btn);
    await canvas.findByText(/Something went wrong/i);
    await canvas.findByText(/Try Again/i);
  },
};

export const SessionExpiredError = {
  name: 'Session Expired → Error',
  render: () => {
    const el = document.createElement('feature-flow');
    el.setAttribute('cardStatus', 'active');
    el.setAttribute('accountHolder', 'Jan de Vries');
    el.service = createMockService({ holdError: { errorCode: 'SESSION_EXPIRED', retryable: false } });
    return el;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const btn = await canvas.findByText('Hold Card');
    await userEvent.click(btn);
    await canvas.findByText(/Session expired/i);
  },
};

export const TimeoutError = {
  name: 'Network Timeout → Error',
  render: () => {
    const el = document.createElement('feature-flow');
    el.setAttribute('cardStatus', 'active');
    el.setAttribute('accountHolder', 'Jan de Vries');
    el.service = createMockService({ holdError: { errorCode: 'TIMEOUT', retryable: true } });
    return el;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const btn = await canvas.findByText('Hold Card');
    await userEvent.click(btn);
    await canvas.findByText(/Request timed out/i);
    await canvas.findByText(/Try Again/i);
  },
};
