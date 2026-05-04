/**
 * Status Error Screen Stories
 *
 * Demonstrates:
 * - argTypes with categories, descriptions, and typed controls
 * - fn() spies for retry/dismiss events → visible in Actions panel
 * - play() with step() grouping → visible in Interactions panel
 * - Edge case variants: empty message, long text, non-retryable
 *
 * Copy-paste guide for new components:
 * 1. Define argTypes for every prop with { control, description, table: { category } }
 * 2. Set args with fn() for each event the component fires
 * 3. Use render() with property assignment (el.prop = args.prop) not HTML attributes
 * 4. Add play() with step() to verify the component works interactively
 * 5. Export edge case stories covering empty, long, boundary states
 *
 * Shadow DOM Note:
 * Storybook's within(canvasElement) only queries light DOM.
 * For LitElement, content lives in Shadow DOM. Use the helper
 * below to get a scoped query target.
 */

import { fn, expect, within, userEvent } from 'storybook/test';
import { StatusErrorScreen } from '../../../../src/components/screens/status-error-screen/status-error-screen.js';

if (!customElements.get('status-error-screen')) {
  customElements.define('status-error-screen', StatusErrorScreen);
}
/**
 * Helper: queries the shadow DOM of the first child web component.
 * Returns the text content and a query helper for the shadow root.
 *
 * Why: Storybook's canvas.getByText only searches light DOM.
 * LitElement renders into Shadow DOM, so we need to query
 * through el.shadowRoot to find text and buttons.
 */
function getShadowContent(canvasElement) {
  const el = canvasElement.querySelector('status-error-screen');
  const root = el?.shadowRoot;
  return { el, root, text: root?.textContent || '' };
}

export default {
  title: 'Components / Error Screen',
  component: 'status-error-screen',

  // ── Controls ──────────────────────────────────────────────────────
  // Each argType maps to a control in the Controls panel.
  // Categories group controls visually. Descriptions show on hover.
  argTypes: {
    // -- Content --
    errorTitle: {
      control: 'text',
      description: 'Heading text shown at the top of the error screen.',
      table: {
        category: 'Content',
        defaultValue: { summary: 'Something went wrong' },
      },
    },
    errorMessage: {
      control: 'text',
      description: 'Detailed message explaining what went wrong.',
      table: {
        category: 'Content',
        defaultValue: { summary: '' },
      },
    },

    // -- Behavior --
    retryable: {
      control: 'boolean',
      description: 'When `true`, shows the retry button. When `false`, only the dismiss button is visible.',
      table: {
        category: 'Behavior',
        defaultValue: { summary: 'true' },
      },
    },

    // -- Labels --
    retryLabel: {
      control: 'text',
      description: 'Label for the retry button (only visible when `retryable` is `true`).',
      table: {
        category: 'Labels',
        defaultValue: { summary: 'Try Again' },
      },
    },
    dismissLabel: {
      control: 'text',
      description: 'Label for the dismiss/back button.',
      table: {
        category: 'Labels',
        defaultValue: { summary: 'Back to overview' },
      },
    },

    // -- Events --
    onRetry: {
      action: 'retry',
      description: 'Fired when the retry button is clicked. The consuming flow should re-attempt the failed API call.',
      table: { category: 'Events' },
    },
    onDismiss: {
      action: 'dismiss',
      description: 'Fired when the dismiss button is clicked. The consuming flow should navigate back.',
      table: { category: 'Events' },
    },
  },

  // ── Default Args ──────────────────────────────────────────────────
  // fn() creates a spy that logs to the Actions panel AND can be
  // asserted in play functions with expect(args.onRetry).toHaveBeenCalled()
  args: {
    errorTitle: 'Something went wrong',
    errorMessage: "We couldn't process your request. Please try again later.",
    retryable: true,
    retryLabel: 'Try Again',
    dismissLabel: 'Back to overview',
    onRetry: fn(),
    onDismiss: fn(),
  },

  // ── Render ────────────────────────────────────────────────────────
  // IMPORTANT: Use property assignment (el.prop = value), not HTML attributes.
  // LitElement properties need the JS setter to trigger reactivity.
  // HTML attributes only work for simple string types, not booleans.
  render: (args) => {
    const el = document.createElement('status-error-screen');
    el.errorTitle = args.errorTitle;
    el.errorMessage = args.errorMessage;
    el.retryable = args.retryable;
    el.retryLabel = args.retryLabel;
    el.dismissLabel = args.dismissLabel;
    el.addEventListener('retry', args.onRetry);
    el.addEventListener('dismiss', args.onDismiss);
    return el;
  },
};

// ── Happy Path: Retryable Error ─────────────────────────────────────

export const GenericRetryable = {
  name: 'Generic - Retryable',
  args: {
    errorTitle: 'Something went wrong',
    errorMessage: "We couldn't process your request. Please try again later.",
    retryable: true,
  },
  play: async ({ args, canvasElement, step }) => {
    await step('Verify error content renders', async () => {
      const { text } = getShadowContent(canvasElement);
      await expect(text).toContain('Something went wrong');
      await expect(text).toContain("couldn't process");
    });

    await step('Click "Try Again" → verify retry event', async () => {
      const { root } = getShadowContent(canvasElement);
      // lion-button has its own shadow DOM — find it and click
      const btn = root.querySelector('lion-button');
      btn.click();
      await expect(args.onRetry).toHaveBeenCalledTimes(1);
    });
  },
};

// ── Timeout Error ───────────────────────────────────────────────────

export const Timeout = {
  name: 'Timeout',
  args: {
    errorTitle: 'Request timed out',
    errorMessage: 'The request took too long. Please try again.',
    retryable: true,
  },
  play: async ({ args, canvasElement, step }) => {
    await step('Verify timeout message', async () => {
      const { text } = getShadowContent(canvasElement);
      await expect(text).toContain('Request timed out');
    });

    await step('Click retry → verify event', async () => {
      const { root } = getShadowContent(canvasElement);
      root.querySelector('lion-button').click();
      await expect(args.onRetry).toHaveBeenCalled();
    });
  },
};

// ── Non-Retryable Error ─────────────────────────────────────────────

export const SessionExpired = {
  name: 'Session Expired (Non-retryable)',
  args: {
    errorTitle: 'Session expired',
    errorMessage: 'Your session has expired. Please log in again.',
    retryable: false,
  },
  play: async ({ args, canvasElement, step }) => {
    await step('Verify error renders', async () => {
      const { text } = getShadowContent(canvasElement);
      await expect(text).toContain('Session expired');
    });

    await step('Verify dismiss button is shown (not retry)', async () => {
      const { text } = getShadowContent(canvasElement);
      await expect(text).toContain('Back to overview');
      await expect(text).not.toContain('Try Again');
    });

    await step('Click dismiss → verify dismiss event', async () => {
      const { root } = getShadowContent(canvasElement);
      root.querySelector('lion-button').click();
      await expect(args.onDismiss).toHaveBeenCalledTimes(1);
    });
  },
};

// ── Edge Cases ──────────────────────────────────────────────────────

export const EmptyMessage = {
  name: 'Edge: Empty Error Message',
  args: {
    errorTitle: 'Something went wrong',
    errorMessage: '',
    retryable: true,
  },
};

export const LongErrorText = {
  name: 'Edge: Long Error Text',
  args: {
    errorTitle: 'A very long error title that might overflow the container and wrap to multiple lines in narrow viewports',
    errorMessage: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    retryable: true,
    retryLabel: 'Retry the operation',
    dismissLabel: 'Go back to the main overview page',
  },
};

export const CustomLabels = {
  name: 'Edge: Custom Button Labels',
  args: {
    errorTitle: 'Payment failed',
    errorMessage: 'Your payment could not be processed at this time.',
    retryable: true,
    retryLabel: 'Retry Payment',
    dismissLabel: 'Cancel',
  },
};
