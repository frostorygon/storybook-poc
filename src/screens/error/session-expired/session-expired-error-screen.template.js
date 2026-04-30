import { html } from 'lit';

/**
 * @param {import('./session-expired-error-screen.js').SessionExpiredErrorScreen} host
 */
export function template(host) {
  return html`
    <status-error-screen>
      <span slot="title">Session expired</span>
      <span slot="description">Your session has expired. Please log in again to continue.</span>
      
      <lion-button slot="actions" @click="${host._onLoginRedirect}">
        Go to Login
      </lion-button>
    </status-error-screen>
  `;
}
