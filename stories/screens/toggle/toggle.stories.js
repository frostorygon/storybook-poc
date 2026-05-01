/**
 * Toggle Screen Stories
 *
 * Demonstrates: argTypes with radio controls, fn() event spies,
 * play functions with step() grouping, and edge case variants.
 *
 * Shadow DOM Note:
 * Storybook's within(canvasElement).getByText() only searches light DOM.
 * LitElement renders into Shadow DOM. Use getShadowContent() to query
 * through el.shadowRoot for text and interactive elements.
 */

import { fn, expect } from 'storybook/test';
import { HoldcardToggleScreen } from '../../../src/screens/toggle/holdcard-toggle-screen.js';
import { activeCardResponse, onHoldCardResponse } from '../../../demo/mocks/scenarios.js';

if (!customElements.get('holdcard-toggle-screen')) {
  customElements.define('holdcard-toggle-screen', HoldcardToggleScreen);
}
/** Shadow DOM query helper */
function getShadowContent(canvasElement) {
  const el = canvasElement.querySelector('holdcard-toggle-screen');
  const root = el?.shadowRoot;
  return { el, root, text: root?.textContent || '' };
}

export default {
  title: 'Screens / Toggle Screen',
  component: 'holdcard-toggle-screen',
  argTypes: {
    cardStatus: {
      control: { type: 'radio' },
      options: ['active', 'on-hold'],
      description: 'Current card state — determines button label and action event payload.',
      table: { category: 'State' },
    },
    accountHolder: {
      control: 'text',
      description: 'Full name of the card account holder.',
      table: { category: 'Data' },
    },
    maskedNumber: {
      control: 'text',
      description: 'Masked card number (e.g. `**** **** **** 1234`).',
      table: { category: 'Data' },
    },
    isLoading: {
      control: 'boolean',
      description: 'When `true`, disables the action button and shows loading state.',
      table: { category: 'State' },
    },
    error: {
      control: 'boolean',
      description: 'When `true`, shows the error visual indicator.',
      table: { category: 'State' },
    },
    onAction: {
      action: 'action',
      description: 'Fired when the hold/unhold button is clicked. Payload: `{ action: "hold" | "unhold" }`.',
      table: { category: 'Events' },
    },
  },
  args: {
    cardStatus: activeCardResponse.cardStatus,
    accountHolder: activeCardResponse.accountHolder,
    maskedNumber: activeCardResponse.maskedNumber,
    isLoading: false,
    error: false,
    onAction: fn(),
  },
  render: (args) => {
    const el = document.createElement('holdcard-toggle-screen');
    el.cardStatus = args.cardStatus;
    el.accountHolder = args.accountHolder;
    el.maskedNumber = args.maskedNumber;
    el.isLoading = args.isLoading;
    el.error = args.error;
    el.addEventListener('action', args.onAction);
    return el;
  },
};

// ── Happy Paths ────────────────────────────────────────────────────

export const ActiveCard = {
  name: 'Active Card',
  args: {
    cardStatus: activeCardResponse.cardStatus,
    accountHolder: activeCardResponse.accountHolder,
    maskedNumber: activeCardResponse.maskedNumber,
  },
  play: async ({ args, canvasElement, step }) => {
    await step('Verify card info renders', async () => {
      const { text } = getShadowContent(canvasElement);
      await expect(text).toContain('Jan de Vries');
      await expect(text).toContain('Hold Card');
    });

    await step('Click Hold Card button', async () => {
      const { root } = getShadowContent(canvasElement);
      root.querySelector('lion-button').click();
    });

    await step('Verify action event fired', async () => {
      await expect(args.onAction).toHaveBeenCalled();
    });
  },
};

export const OnHoldCard = {
  name: 'On Hold Card',
  args: {
    cardStatus: onHoldCardResponse.cardStatus,
    accountHolder: onHoldCardResponse.accountHolder,
    maskedNumber: onHoldCardResponse.maskedNumber,
  },
  play: async ({ args, canvasElement, step }) => {
    await step('Verify on-hold state renders', async () => {
      const { text } = getShadowContent(canvasElement);
      await expect(text).toContain('Jan de Vries');
      await expect(text).toContain('Unhold Card');
    });

    await step('Click Unhold Card button', async () => {
      const { root } = getShadowContent(canvasElement);
      root.querySelector('lion-button').click();
    });

    await step('Verify action event fired', async () => {
      await expect(args.onAction).toHaveBeenCalled();
    });
  },
};

// ── Edge Cases ─────────────────────────────────────────────────────

export const LoadingState = {
  name: 'Loading State',
  args: {
    cardStatus: 'active',
    accountHolder: 'Jan de Vries',
    maskedNumber: '**** **** **** 1234',
    isLoading: true,
  },
  play: async ({ canvasElement, step }) => {
    await step('Verify loading indicator', async () => {
      const { text } = getShadowContent(canvasElement);
      await expect(text).toContain('Loading card details');
    });
  },
};

export const ErrorState = {
  name: 'Error State',
  args: {
    cardStatus: 'active',
    accountHolder: 'Jan de Vries',
    maskedNumber: '**** **** **** 1234',
    error: true,
  },
  play: async ({ canvasElement, step }) => {
    await step('Verify error message', async () => {
      const { text } = getShadowContent(canvasElement);
      await expect(text).toContain('Failed to load card details');
    });
  },
};

export const LongAccountHolder = {
  name: 'Edge: Long Account Holder',
  args: {
    cardStatus: 'active',
    accountHolder: 'Dr. Alexander Bartholomew Christopherson-Worthington III',
    maskedNumber: '**** **** **** 9999',
    isLoading: false,
    error: false,
  },
};
