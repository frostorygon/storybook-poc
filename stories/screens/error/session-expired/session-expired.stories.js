/**
 * Session Expired Error Screen Stories
 *
 * This is a "Smart Component" story — it demonstrates a domain-specific
 * screen that wraps the generic status-error-screen with hard-coded
 * session-expired copy and a login redirect action.
 *
 * Demonstrates:
 * - fn() spy for the auth-redirect custom event
 * - play() with step() to verify the redirect flow
 * - How smart components differ from generic ones in Storybook:
 *   no argTypes (props are internal), only events are exposed
 * - Shadow DOM querying for nested web components
 */

import { fn, expect } from 'storybook/test';
import { SessionExpiredErrorScreen } from '../../../../src/screens/error/session-expired/session-expired-error-screen.js';

if (!customElements.get('session-expired-error-screen')) {
  customElements.define('session-expired-error-screen', SessionExpiredErrorScreen);
}
/** Shadow DOM query helper — goes two levels deep (screen → status-error-screen) */
function getDeepShadowContent(canvasElement) {
  const el = canvasElement.querySelector('session-expired-error-screen');
  const root = el?.shadowRoot;
  return { el, root, text: root?.textContent || '' };
}

export default {
  title: 'Screens / Error / Session Expired',
  component: 'session-expired-error-screen',

  // Smart components have no public props to control.
  // Only the event is exposed as an action.
  argTypes: {
    onAuthRedirect: {
      action: 'auth-redirect',
      description: 'Fired when "Go to Login" is clicked. The consuming shell should redirect to the auth provider.',
      table: { category: 'Events' },
    },
  },

  args: {
    onAuthRedirect: fn(),
  },

  render: (args) => {
    const el = document.createElement('session-expired-error-screen');
    el.addEventListener('auth-redirect', args.onAuthRedirect);
    return el;
  },
};

// ── Default ─────────────────────────────────────────────────────────

export const Default = {
  name: 'Session Expired',
  play: async ({ args, canvasElement, step }) => {
    await step('Verify session expired content', async () => {
      const { text } = getDeepShadowContent(canvasElement);
      await expect(text).toContain('Session expired');
      await expect(text).toContain('log in again');
    });

    await step('Click "Go to Login" → verify auth-redirect event', async () => {
      const { root } = getDeepShadowContent(canvasElement);
      root.querySelector('lion-button').click();
      await expect(args.onAuthRedirect).toHaveBeenCalledTimes(1);
    });
  },
};
