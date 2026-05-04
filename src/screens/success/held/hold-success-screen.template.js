import { html } from 'lit';

/**
 * @param {object} props
 * @param {(e: Event) => void} props.onDismiss
 */
export function template({ onDismiss }) {
  return html`
    <status-success-screen
      .successTitle=${'Card successfully put on hold'}
      .successMessage=${'Your card is now frozen and cannot be used for new transactions.'}
      .dismissLabel=${'Back to overview'}
      @dismiss="${onDismiss}"
    ></status-success-screen>
  `;
}
