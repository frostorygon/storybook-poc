/**
 * Error Screen Stories
 *
 * Demonstrates the variant-driven ErrorScreen component. Each story
 * renders a different `errorType` to showcase all error states.
 *
 * Pattern: Single component, multiple variants via `error-type` attribute.
 * This follows the account-closure ErrorScreen convention.
 */

import { fn, expect } from 'storybook/test';
import { ErrorScreen } from '../../../src/screens/error/error-screen.js';
import { withPhoneFrame } from '../../../.storybook/decorators/phone-frame.js';

if (!customElements.get('error-screen')) {
  customElements.define('error-screen', ErrorScreen);
}

/**
 * Shadow DOM query — traverses two shadow roots:
 * error-screen → status-error-screen shell → text/buttons
 *
 * Text is combined from both layers because:
 * - Prop-based variants render text inside the shell's shadow root
 * - Slot-based variants (SessionExpired) render text in the screen's shadow root
 */
function getContent(canvasElement) {
  const el = canvasElement.querySelector('error-screen');
  const screenRoot = el?.shadowRoot;
  const shell = screenRoot?.querySelector('status-error-screen');
  const shellRoot = shell?.shadowRoot;
  const text = [screenRoot?.textContent, shellRoot?.textContent]
    .filter(Boolean)
    .join(' ');
  return {
    el,
    root: shellRoot || screenRoot,
    text,
    button: screenRoot?.querySelector('lion-button') || shellRoot?.querySelector('lion-button'),
  };
}

export default {
  title: 'Screens / Error',
  component: 'error-screen',
  decorators: [withPhoneFrame],

  argTypes: {
    errorType: {
      control: 'select',
      options: ['SomethingWentWrong', 'Timeout', 'SessionExpired'],
      description: 'Selects which error variant to render.',
      table: { category: 'Properties' },
    },
    onRetry: {
      action: 'retry',
      description: 'Fired when "Try Again" is clicked (generic, timeout).',
      table: { category: 'Events' },
    },
    onDismiss: {
      action: 'dismiss',
      description: 'Fired when "Back to overview" is clicked.',
      table: { category: 'Events' },
    },
    onAuthRedirect: {
      action: 'auth-redirect',
      description: 'Fired when "Go to Login" is clicked (session expired).',
      table: { category: 'Events' },
    },
  },

  args: {
    errorType: 'SomethingWentWrong',
    onRetry: fn(),
    onDismiss: fn(),
    onAuthRedirect: fn(),
  },

  render: (args) => {
    const el = document.createElement('error-screen');
    el.errorType = args.errorType;
    el.addEventListener('retry', args.onRetry);
    el.addEventListener('dismiss', args.onDismiss);
    el.addEventListener('auth-redirect', args.onAuthRedirect);
    return el;
  },
};

// ── Variants ───────────────────────────────────────────────────────

export const SomethingWentWrong = {
  name: 'Something Went Wrong',
  args: { errorType: 'SomethingWentWrong' },
  play: async ({ canvasElement, step }) => {
    await step('Verify generic error content', async () => {
      const { text } = getContent(canvasElement);
      await expect(text).toContain('Something went wrong');
    });
  },
};

export const Timeout = {
  name: 'Request Timed Out',
  args: { errorType: 'Timeout' },
  play: async ({ canvasElement, step }) => {
    await step('Verify timeout error content', async () => {
      const { text } = getContent(canvasElement);
      await expect(text).toContain('Request timed out');
    });
  },
};

export const SessionExpired = {
  name: 'Session Expired',
  args: { errorType: 'SessionExpired' },
  play: async ({ args, canvasElement, step }) => {
    await step('Verify session expired content', async () => {
      const { text } = getContent(canvasElement);
      await expect(text).toContain('Session expired');
      await expect(text).toContain('log in again');
    });

    await step('Click "Go to Login" → verify auth-redirect event', async () => {
      const { button } = getContent(canvasElement);
      button.click();
      await expect(args.onAuthRedirect).toHaveBeenCalledTimes(1);
    });
  },
};
