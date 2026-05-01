import { html } from 'lit';
import { SessionExpiredErrorScreen } from './session-expired-error-screen.js';

customElements.define('session-expired-error-screen', SessionExpiredErrorScreen);

export default {
  title: 'Screens/Error/Session Expired',
  component: 'session-expired-error-screen',
};

export const Default = () => html`<session-expired-error-screen></session-expired-error-screen>`;
