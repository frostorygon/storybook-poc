import { html } from 'lit';

/**
 * @param {object} props
 * @param {(e: Event) => void} props.onRetry
 * @param {(e: Event) => void} props.onDismiss
 */
export function template({ onRetry, onDismiss }) {
  return html`
    <status-error-screen
      .errorTitle=${'Request timed out'}
      .errorMessage=${'The request took too long. Please try again.'}
      ?retryable=${true}
      .retryLabel=${'Try Again'}
      .dismissLabel=${'Back to overview'}
      @retry="${onRetry}"
      @dismiss="${onDismiss}"
    ></status-error-screen>
  `;
}
