import { html } from 'lit';

/**
 * Template functions for each success variant.
 */

/**
 * @param {object} props
 * @param {(e: Event) => void} props.onDismiss
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
 * @param {object} props
 * @param {(e: Event) => void} props.onDismiss
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
