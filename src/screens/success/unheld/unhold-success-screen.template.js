import { html } from 'lit';

/**
 * @param {object} props
 * @param {(e: Event) => void} props.onDismiss
 */
export function template({ onDismiss }) {
  return html`
    <status-success-screen
      .successTitle=${'Card successfully reactivated'}
      .successMessage=${'Your card is active and ready to be used again.'}
      .dismissLabel=${'Back to overview'}
      @dismiss="${onDismiss}"
    ></status-success-screen>
  `;
}
