import { html } from 'lit';

/**
 * Render functions for each success variant.
 */

/** @param {import('./success-screen.js').SuccessScreen} host */
export function renderHeld(host) {
  return html`
    <status-success-screen
      .successTitle=${'Card successfully put on hold'}
      .successMessage=${'Your card is now frozen and cannot be used for new transactions.'}
      .dismissLabel=${'Back to overview'}
      @dismiss="${() => host._onDismiss()}"
    ></status-success-screen>
  `;
}

/** @param {import('./success-screen.js').SuccessScreen} host */
export function renderUnheld(host) {
  return html`
    <status-success-screen
      .successTitle=${'Card successfully reactivated'}
      .successMessage=${'Your card is active and ready to be used again.'}
      .dismissLabel=${'Back to overview'}
      @dismiss="${() => host._onDismiss()}"
    ></status-success-screen>
  `;
}
