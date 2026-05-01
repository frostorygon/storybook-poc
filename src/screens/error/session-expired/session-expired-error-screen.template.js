import { html } from 'lit';

/**
 * Pure template function for the session expired error screen.
 *
 * @param {object} props
 * @param {(e: Event) => void} props.onLoginRedirect
 */
export function template({ onLoginRedirect }) {
  return html`
    <status-error-screen>
      <span slot="title">Session expired</span>
      <span slot="description">Your session has expired. Please log in again to continue.</span>
      
      <lion-button slot="actions" @click="${onLoginRedirect}">
        Go to Login
      </lion-button>
    </status-error-screen>
  `;
}
