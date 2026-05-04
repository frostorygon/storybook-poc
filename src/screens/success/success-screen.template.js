import { html } from 'lit';

/**
 * Template functions for each success variant.
 */

/**
 * @typedef {object} SuccessParams
 * @property {(e: Event) => void} onDismiss - Called when the user clicks dismiss
 */

/**
 * @param {SuccessParams} params
 */
export function templateHeld({ onDismiss }) {
  return html`
    <status-success-screen
      .successTitle=${'Card successfully put on hold'}
      .successMessage=${'Your card is now frozen and cannot be used for new transactions.'}
      .dismissLabel=${'Back to overview'}
      @dismiss="${onDismiss}"
    ></status-success-screen>
  `;
}

/**
 * @param {SuccessParams} params
 */
export function templateUnheld({ onDismiss }) {
  return html`
    <status-success-screen
      .successTitle=${'Card successfully reactivated'}
      .successMessage=${'Your card is active and ready to be used again.'}
      .dismissLabel=${'Back to overview'}
      @dismiss="${onDismiss}"
    ></status-success-screen>
  `;
}
