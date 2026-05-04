/**
 * Flow Scenarios — Temporary Holdcard
 *
 * Each story defines its mocks via parameters.mocks using @web/mocks handlers.
 * The "Mocks" addon panel shows each endpoint, method, and allows
 * live editing of responses and status codes.
 *
 * Shadow DOM Note:
 * Since feature-flow renders child web components into its Shadow DOM,
 * and those children render content into their own Shadow DOMs, we must
 * use a recursive query helper + waitFor() to verify asynchronous states.
 */

import { html } from 'lit';
import { expect, userEvent, waitFor } from 'storybook/test';
import '../src/feature-flow.js';
import {
  getCard,
  getCardOnHold,
  holdCard,
  unholdCard,
  holdCardGenericError,
  holdCardTimeout,
  holdCardSessionExpired,
} from '../demo/mocks/scenarios.js';

export default {
  title: 'Flows / Scenarios',
};

/**
 * Helper to query two levels of Shadow DOM:
 * feature-flow -> active screen -> shell -> text/buttons
 */
function getFlowContent(canvasElement) {
  const flow = canvasElement.querySelector('feature-flow');
  const flowRoot = flow?.shadowRoot;
  const screen = flowRoot?.querySelector(
    'holdcard-toggle-screen, error-screen, success-screen'
  );
  const screenRoot = screen?.shadowRoot;

  // Variant screens wrap a shell (status-error-screen / status-success-screen)
  // which has its own shadow root containing the actual text content.
  const shell = screenRoot?.querySelector('status-error-screen, status-success-screen');
  const shellRoot = shell?.shadowRoot;

  return {
    text: shellRoot?.textContent || screenRoot?.textContent || '',
    button: shellRoot?.querySelector('lion-button') || screenRoot?.querySelector('lion-button'),
  };
}

/** 
 * Helper to slow down interactions so developers can visually watch 
 * the scenario play out like a slow-motion video.
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ── Happy Paths ────────────────────────────────────────────────────

export const HoldCard = {
  name: 'Hold Card',
  parameters: {
    mocks: [getCard, holdCard],
  },
  render: () => html`
    <feature-flow
      cardStatus="active"
      accountHolder="Jan de Vries"
      cardId="CARD-1234-5678-9012">
    </feature-flow>
  `,
  play: async ({ canvasElement, step }) => {
    await step('Verify toggle screen renders', async () => {
      await sleep(1000); // Slow down for visual debugging
      await waitFor(() => {
        const { text } = getFlowContent(canvasElement);
        expect(text).toContain('Jan de Vries');
      });
    });

    await step('Click "Hold Card"', async () => {
      await sleep(1000);
      await waitFor(async () => {
        const { button } = getFlowContent(canvasElement);
        expect(button).toBeTruthy();
        await userEvent.click(button);
      });
    });

    await step('Verify success screen appears', async () => {
      await sleep(1000);
      await waitFor(() => {
        const { text } = getFlowContent(canvasElement);
        expect(text).toContain('successfully put on hold');
      });
    });
  },
};

export const UnholdCard = {
  name: 'Unhold Card',
  parameters: {
    mocks: [getCardOnHold, unholdCard],
  },
  render: () => html`
    <feature-flow
      cardStatus="on-hold"
      accountHolder="Jan de Vries"
      cardId="CARD-1234-5678-9012">
    </feature-flow>
  `,
  play: async ({ canvasElement, step }) => {
    await step('Verify on-hold toggle screen', async () => {
      await sleep(1000);
      await waitFor(() => {
        const { text } = getFlowContent(canvasElement);
        expect(text).toContain('Jan de Vries');
      });
    });

    await step('Click "Unhold Card"', async () => {
      await sleep(1000);
      await waitFor(async () => {
        const { button } = getFlowContent(canvasElement);
        expect(button).toBeTruthy();
        await userEvent.click(button);
      });
    });

    await step('Verify reactivation success', async () => {
      await sleep(1000);
      await waitFor(() => {
        const { text } = getFlowContent(canvasElement);
        expect(text).toContain('reactivated');
      });
    });
  },
};

// ── Error Scenarios ────────────────────────────────────────────────

export const APIUnavailableError = {
  name: 'API Unavailable → Error',
  parameters: {
    mocks: [getCard, holdCardGenericError],
  },
  render: () => html`
    <feature-flow
      cardStatus="active"
      accountHolder="Jan de Vries"
      cardId="CARD-1234-5678-9012">
    </feature-flow>
  `,
  play: async ({ canvasElement, step }) => {
    await step('Trigger API error', async () => {
      await sleep(1000);
      await waitFor(async () => {
        const { button } = getFlowContent(canvasElement);
        expect(button).toBeTruthy();
        await userEvent.click(button);
      });
    });

    await step('Verify error screen with retry', async () => {
      await sleep(1000);
      await waitFor(() => {
        const { text } = getFlowContent(canvasElement);
        expect(text).toContain('Something went wrong');
        expect(text).toContain('Try Again');
      });
    });
  },
};

export const SessionExpiredError = {
  name: 'Session Expired → Error',
  parameters: {
    mocks: [getCard, holdCardSessionExpired],
  },
  render: () => html`
    <feature-flow
      cardStatus="active"
      accountHolder="Jan de Vries"
      cardId="CARD-1234-5678-9012">
    </feature-flow>
  `,
  play: async ({ canvasElement, step }) => {
    await step('Trigger session expired error', async () => {
      await sleep(1000);
      await waitFor(async () => {
        const { button } = getFlowContent(canvasElement);
        expect(button).toBeTruthy();
        await userEvent.click(button);
      });
    });

    await step('Verify session expired screen', async () => {
      await sleep(1000);
      await waitFor(() => {
        const { text } = getFlowContent(canvasElement);
        expect(text).toContain('Session expired');
      });
    });
  },
};

export const TimeoutError = {
  name: 'Network Timeout → Error',
  parameters: {
    mocks: [getCard, holdCardTimeout],
  },
  render: () => html`
    <feature-flow
      cardStatus="active"
      accountHolder="Jan de Vries"
      cardId="CARD-1234-5678-9012">
    </feature-flow>
  `,
  play: async ({ canvasElement, step }) => {
    await step('Trigger timeout error', async () => {
      await sleep(1000);
      await waitFor(async () => {
        const { button } = getFlowContent(canvasElement);
        expect(button).toBeTruthy();
        await userEvent.click(button);
      });
    });

    await step('Verify timeout error screen with retry', async () => {
      await sleep(1000);
      await waitFor(() => {
        const { text } = getFlowContent(canvasElement);
        expect(text).toContain('Request timed out');
        expect(text).toContain('Try Again');
      });
    });
  },
};
