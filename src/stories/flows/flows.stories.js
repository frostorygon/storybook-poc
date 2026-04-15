/**
 * Flow Scenarios — Temporary Holdcard
 *
 * ✅ Hold Card — user holds an active card successfully
 * ✅ Unhold Card — user unholds a held card successfully
 * ✅ API Unavailable → Error — backend is down
 * ✅ Session Expired → Error — token expires mid-flow
 * 🔲 Network Timeout → Error (planned)
 */

import { html } from 'lit';
import { within, userEvent, expect } from '@storybook/test';
import '../../holdcard-flow/feature-flow.js';

export default {
  title: 'Flows',
};

export const HoldCard = {
  name: 'Hold Card',
  parameters: {
    mockData: [
      {
        url: '/api/v1/cards/*/hold',
        method: 'POST',
        status: 200,
        response: { message: "Card put on hold successfully" },
      },
    ],
  },
  render: () => html`<feature-flow cardStatus="active" accountHolder="Jan de Vries" cardId="CARD-1234-5678-9012"></feature-flow>`,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Click the Hold Card button
    const btn = await canvas.findByText('Hold Card');
    await userEvent.click(btn);
    // Assert success screen appears
    await canvas.findByText(/Card successfully put on hold/i);
  },
};

export const UnholdCard = {
  name: 'Unhold Card',
  parameters: {
    mockData: [
      {
        url: '/api/v1/cards/*/unhold',
        method: 'POST',
        status: 200,
        response: { message: "Card unheld successfully" },
      },
    ],
  },
  render: () => html`<feature-flow cardStatus="on-hold" accountHolder="Jan de Vries" cardId="CARD-1234-5678-9012"></feature-flow>`,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const btn = await canvas.findByText('Unhold Card');
    await userEvent.click(btn);
    await canvas.findByText(/reactivated/i);
  },
};

export const APIUnavailableError = {
  name: 'API Unavailable → Error',
  parameters: {
    mockData: [
      {
        url: '/api/v1/cards/*/hold',
        method: 'POST',
        status: 503,
        response: { message: "Service unavailable" },
      },
    ],
  },
  render: () => html`<feature-flow cardStatus="active" mockErrorMode="GENERIC_ERROR" accountHolder="Jan de Vries"></feature-flow>`,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const btn = await canvas.findByText('Hold Card');
    await userEvent.click(btn);
    await canvas.findByText(/Something went wrong/i);
    // Verify retry button is present
    await canvas.findByText(/Try Again/i);
  },
};

export const SessionExpiredError = {
  name: 'Session Expired → Error',
  parameters: {
    mockData: [
      {
        url: '/api/v1/cards/*/hold',
        method: 'POST',
        status: 401,
        response: { message: "Session Expired" },
      },
    ],
  },
  render: () => html`<feature-flow cardStatus="active" mockErrorMode="SESSION_EXPIRED" accountHolder="Jan de Vries"></feature-flow>`,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const btn = await canvas.findByText('Hold Card');
    await userEvent.click(btn);
    await canvas.findByText(/Session expired/i);
    // Session expired is NOT retryable — should show Back to overview, not Try Again
    const tryAgain = canvasElement.querySelector('holdcard-error-screen')
      ?.shadowRoot?.querySelector('lion-button');
    await expect(tryAgain?.textContent?.trim()).not.to.equal('Try Again');
  },
};
