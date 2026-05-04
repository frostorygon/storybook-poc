import { html } from 'lit';

/**
 * Template functions for each error variant.
 * Each function receives explicit parameters — not the component instance.
 *
 * Naming follows guideline 03: `template` + VariantName.
 * When localization (msgLit) is added, pass it as a parameter per guideline 03's
 * "Translations in Templates" section.
 */

/**
 * @typedef {object} RetryableErrorParams
 * @property {(e: Event) => void} onRetry - Called when the user clicks retry
 * @property {(e: Event) => void} onDismiss - Called when the user clicks dismiss
 */

/**
 * @typedef {object} SessionExpiredParams
 * @property {(e: Event) => void} onAuthRedirect - Called when the user clicks "Go to Login"
 */

/**
 * @param {RetryableErrorParams} params
 */
export function templateSomethingWentWrong({ onRetry, onDismiss }) {
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
 * @param {RetryableErrorParams} params
 */
export function templateTimeout({ onRetry, onDismiss }) {
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
 * @param {SessionExpiredParams} params
 */
export function templateSessionExpired({ onAuthRedirect }) {
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
