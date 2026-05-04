/**
 * Success Screen Stories
 *
 * Demonstrates the variant-driven SuccessScreen component. Each story
 * renders a different `successType` to showcase all success states.
 *
 * Pattern: Single component, multiple variants via `success-type` attribute.
 */

import { fn, expect } from 'storybook/test';
import { SuccessScreen } from '../../../src/screens/success/success-screen.js';
import { withPhoneFrame } from '../../../.storybook/decorators/phone-frame.js';

if (!customElements.get('success-screen')) {
  customElements.define('success-screen', SuccessScreen);
}

/**
 * Shadow DOM query — traverses two shadow roots:
 * success-screen → status-success-screen shell → text/buttons
 */
function getContent(canvasElement) {
  const el = canvasElement.querySelector('success-screen');
  const screenRoot = el?.shadowRoot;
  const shell = screenRoot?.querySelector('status-success-screen');
  const shellRoot = shell?.shadowRoot;
  return {
    el,
    root: shellRoot || screenRoot,
    text: shellRoot?.textContent || screenRoot?.textContent || '',
  };
}

export default {
  title: 'Screens / Success',
  component: 'success-screen',
  decorators: [withPhoneFrame],

  argTypes: {
    successType: {
      control: 'select',
      options: ['Held', 'Unheld'],
      description: 'Selects which success variant to render.',
      table: { category: 'Properties' },
    },
    onDismiss: {
      action: 'dismiss',
      description: 'Fired when the dismiss button is clicked.',
      table: { category: 'Events' },
    },
  },

  args: {
    successType: 'Held',
    onDismiss: fn(),
  },

  render: (args) => {
    const el = document.createElement('success-screen');
    el.successType = args.successType;
    el.addEventListener('dismiss', args.onDismiss);
    return el;
  },
};

// ── Variants ───────────────────────────────────────────────────────

export const CardPutOnHold = {
  name: 'Card Put On Hold',
  args: { successType: 'Held' },
  play: async ({ canvasElement, step }) => {
    await step('Verify hold success content', async () => {
      const { text } = getContent(canvasElement);
      await expect(text).toContain('successfully put on hold');
    });
  },
};

export const CardReactivated = {
  name: 'Card Reactivated',
  args: { successType: 'Unheld' },
  play: async ({ canvasElement, step }) => {
    await step('Verify reactivation success content', async () => {
      const { text } = getContent(canvasElement);
      await expect(text).toContain('successfully reactivated');
    });
  },
};
