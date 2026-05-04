import { html } from 'lit';

/**
 * Render functions for each error variant.
 * Each function receives the host component and wires only the handlers it needs.
 */

/** @param {import('./error-screen.js').ErrorScreen} host */
export function renderSomethingWentWrong(host) {
  return html`
    <status-error-screen
      .errorTitle=${"Something went wrong"}
      .errorMessage=${"We couldn't process your request. Please try again later."}
      ?retryable=${true}
      .retryLabel=${'Try Again'}
      .dismissLabel=${'Back to overview'}
      @retry="${() => host._onRetry()}"
      @dismiss="${() => host._onDismiss()}"
    ></status-error-screen>
  `;
}

/** @param {import('./error-screen.js').ErrorScreen} host */
export function renderTimeout(host) {
  return html`
    <status-error-screen
      .errorTitle=${'Request timed out'}
      .errorMessage=${'The request took too long. Please try again.'}
      ?retryable=${true}
      .retryLabel=${'Try Again'}
      .dismissLabel=${'Back to overview'}
      @retry="${() => host._onRetry()}"
      @dismiss="${() => host._onDismiss()}"
    ></status-error-screen>
  `;
}

/** @param {import('./error-screen.js').ErrorScreen} host */
export function renderSessionExpired(host) {
  return html`
    <status-error-screen>
      <span slot="title">Session expired</span>
      <span slot="description">Your session has expired. Please log in again to continue.</span>

      <lion-button slot="actions" @click="${() => host._onAuthRedirect()}">
        Go to Login
      </lion-button>
    </status-error-screen>
  `;
}
