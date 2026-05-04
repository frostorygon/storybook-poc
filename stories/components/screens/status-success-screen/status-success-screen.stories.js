/**
 * Status Success Screen Stories
 *
 * Demonstrates:
 * - argTypes with categories and descriptions
 * - fn() spy for the dismiss event → visible in Actions panel
 * - play() with step() grouping → visible in Interactions panel
 * - Edge case variants: long message, empty title
 * - Shadow DOM querying pattern for web components
 */

import { fn, expect, within, userEvent } from 'storybook/test';
import { StatusSuccessScreen } from '../../../../src/components/screens/status-success-screen/status-success-screen.js';

if (!customElements.get('status-success-screen')) {
  customElements.define('status-success-screen', StatusSuccessScreen);
}
/** Shadow DOM query helper — see error screen stories for detailed comments */
function getShadowContent(canvasElement) {
  const el = canvasElement.querySelector('status-success-screen');
  const root = el?.shadowRoot;
  return { el, root, text: root?.textContent || '' };
}

export default {
  title: 'Components / Success Screen',
  component: 'status-success-screen',

  // ── Controls ──────────────────────────────────────────────────────
  argTypes: {
    // -- Content --
    successTitle: {
      control: 'text',
      description: 'Heading text for the success confirmation.',
      table: {
        category: 'Content',
        defaultValue: { summary: '' },
      },
    },
    successMessage: {
      control: 'text',
      description: 'Detailed message explaining what happened.',
      table: {
        category: 'Content',
        defaultValue: { summary: '' },
      },
    },

    // -- Labels --
    dismissLabel: {
      control: 'text',
      description: 'Label for the dismiss/navigation button.',
      table: {
        category: 'Labels',
        defaultValue: { summary: 'Back to overview' },
      },
    },

    // -- Events --
    onDismiss: {
      action: 'dismiss',
      description: 'Fired when the dismiss button is clicked. The consuming flow should navigate back.',
      table: { category: 'Events' },
    },
  },

  // ── Default Args ──────────────────────────────────────────────────
  args: {
    successTitle: 'Card successfully put on hold',
    successMessage: 'Your card is now frozen and cannot be used for new transactions.',
    dismissLabel: 'Back to overview',
    onDismiss: fn(),
  },

  // ── Render ────────────────────────────────────────────────────────
  render: (args) => {
    const el = document.createElement('status-success-screen');
    el.successTitle = args.successTitle;
    el.successMessage = args.successMessage;
    el.dismissLabel = args.dismissLabel;
    el.addEventListener('dismiss', args.onDismiss);
    return el;
  },
};

// ── Happy Path: Card Held ───────────────────────────────────────────

export const CardHeld = {
  name: 'Card Put On Hold',
  args: {
    successTitle: 'Card successfully put on hold',
    successMessage: 'Your card is now frozen and cannot be used for new transactions.',
    dismissLabel: 'Back to overview',
  },
  play: async ({ args, canvasElement, step }) => {
    await step('Verify success content renders', async () => {
      const { text } = getShadowContent(canvasElement);
      await expect(text).toContain('successfully put on hold');
      await expect(text).toContain('frozen');
    });

    await step('Click dismiss → verify event', async () => {
      const { root } = getShadowContent(canvasElement);
      root.querySelector('lion-button').click();
      await expect(args.onDismiss).toHaveBeenCalledTimes(1);
    });
  },
};

// ── Happy Path: Card Reactivated ────────────────────────────────────

export const CardReactivated = {
  name: 'Card Reactivated',
  args: {
    successTitle: 'Card successfully reactivated',
    successMessage: 'Your card is active and ready to be used again.',
    dismissLabel: 'Back to overview',
  },
  play: async ({ args, canvasElement, step }) => {
    await step('Verify reactivation message', async () => {
      const { text } = getShadowContent(canvasElement);
      await expect(text).toContain('reactivated');
    });

    await step('Click dismiss → verify event', async () => {
      const { root } = getShadowContent(canvasElement);
      root.querySelector('lion-button').click();
      await expect(args.onDismiss).toHaveBeenCalledTimes(1);
    });
  },
};

// ── Edge Cases ──────────────────────────────────────────────────────

export const LongMessage = {
  name: 'Edge: Long Message Overflow',
  args: {
    successTitle: 'Your temporary card hold has been successfully applied to all linked accounts',
    successMessage: 'The hold has been applied across all payment networks including Visa, Mastercard, and local schemes. Any pending transactions that were initiated before the hold will still be processed. Recurring payments such as subscriptions and direct debits will be paused until the card is reactivated. You will receive a confirmation email at your registered address.',
    dismissLabel: 'Return to card management dashboard',
  },
};

export const EmptyTitle = {
  name: 'Edge: Empty Title',
  args: {
    successTitle: '',
    successMessage: 'Operation completed.',
    dismissLabel: 'OK',
  },
};

export const CustomDismissLabel = {
  name: 'Edge: Custom Dismiss Label',
  args: {
    successTitle: 'Card blocked successfully',
    successMessage: 'Your card has been permanently blocked as requested.',
    dismissLabel: 'Go to Card Overview →',
  },
};
