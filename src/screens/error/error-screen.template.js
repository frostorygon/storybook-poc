import { html } from 'lit';

/**
 * Render functions for each error variant.
 * Each function receives explicit props — not the component instance.
 *
 * When localization (msgLit) is added, these will switch to receiving
 * the component context (ctx) like the account-closure pattern.
 */

/**
 * @param {object} props
 * @param {(e: Event) => void} props.onRetry
 * @param {(e: Event) => void} props.onDismiss
 */
export function renderSomethingWentWrong({ onRetry, onDismiss }) {
  return html`
    <status-error-screen
      .errorTitle=${"Something went wrong"}
      .errorMessage=${"We couldn't process your request. Please try again later."}
      ?retryable=${true}
      .retryLabel=${'Try Again'}
      .dismissLabel=${'Back to overview'}
      @retry="${onRetry}"
      @dismiss="${onDismiss}"
    ></status-error-screen>
  `;
}

/**
 * @param {object} props
 * @param {(e: Event) => void} props.onRetry
 * @param {(e: Event) => void} props.onDismiss
 */
export function renderTimeout({ onRetry, onDismiss }) {
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

/**
 * @param {object} props
 * @param {(e: Event) => void} props.onAuthRedirect
 */
export function renderSessionExpired({ onAuthRedirect }) {
  return html`
    <status-error-screen>
      <span slot="title">Session expired</span>
      <span slot="description">Your session has expired. Please log in again to continue.</span>

      <lion-button slot="actions" @click="${onAuthRedirect}">
        Go to Login
      </lion-button>
    </status-error-screen>
  `;
}
