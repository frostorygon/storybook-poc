// @ts-check
import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { LitElement } from 'lit';
import { StatusErrorScreen } from '../../../components/screens/status-error-screen/index.js';
import { template } from './session-expired-error-screen.template.js';
import { styles } from './session-expired-error-screen.styles.js';

/**
 * session-expired-error-screen
 * 
 * A specialized "Smart Component" that handles the Auth redirection domain logic
 * and wraps the generic status-error-screen to lock in the layout.
 *
 * Note: The <lion-button> used in the template is resolved by the parent
 * status-error-screen's scoped registry, not this component's.
 */
export class SessionExpiredErrorScreen extends ScopedElementsMixin(LitElement) {
  static get scopedElements() {
    return {
      'status-error-screen': StatusErrorScreen,
    };
  }

  static get styles() {
    return styles;
  }

  _onLoginRedirect() {
    // In a real app, this would integrate with the actual Auth Service / Router
    console.log('Redirecting to login...');
    this.dispatchEvent(new CustomEvent('auth-redirect', { bubbles: true, composed: true }));
  }

  render() {
    return template(this);
  }
}
