// @ts-check
import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { LitElement } from 'lit';
import { StatusErrorScreen } from '../../components/screens/status-error-screen/index.js';
import {
  renderSomethingWentWrong,
  renderTimeout,
  renderSessionExpired,
} from './error-screen.template.js';
import { styles } from './error-screen.styles.js';

/**
 * @typedef {'SomethingWentWrong' | 'Timeout' | 'SessionExpired'} ErrorType
 */

/**
 * error-screen
 *
 * Single screen component that handles all error variants via the
 * `errorType` property. Each variant has its own render function in
 * the template file, giving full control over copy, buttons, and behavior.
 *
 * Follows the account-closure ErrorScreen pattern.
 *
 * @fires {CustomEvent} retry - retryable errors (generic, timeout)
 * @fires {CustomEvent} dismiss - all error variants
 * @fires {CustomEvent} auth-redirect - session expired only
 */
export class ErrorScreen extends ScopedElementsMixin(LitElement) {
  static get scopedElements() {
    return {
      'status-error-screen': StatusErrorScreen,
    };
  }

  static get properties() {
    return {
      errorType: { type: String, attribute: 'error-type' },
    };
  }

  static get styles() {
    return styles;
  }

  constructor() {
    super();
    /** @type {ErrorType} */
    this.errorType = 'SomethingWentWrong';
  }

  // ── Event handlers ─────────────────────────────────────────────

  _onRetry() {
    this.dispatchEvent(new CustomEvent('retry', { bubbles: true, composed: true }));
  }

  _onDismiss() {
    this.dispatchEvent(new CustomEvent('dismiss', { bubbles: true, composed: true }));
  }

  _onAuthRedirect() {
    console.log('Redirecting to login...');
    this.dispatchEvent(new CustomEvent('auth-redirect', { bubbles: true, composed: true }));
  }

  // ── Private render methods (param assembly) ────────────────────

  _renderSomethingWentWrong() {
    return renderSomethingWentWrong({
      onRetry: () => this._onRetry(),
      onDismiss: () => this._onDismiss(),
    });
  }

  _renderTimeout() {
    return renderTimeout({
      onRetry: () => this._onRetry(),
      onDismiss: () => this._onDismiss(),
    });
  }

  _renderSessionExpired() {
    return renderSessionExpired({
      onAuthRedirect: () => this._onAuthRedirect(),
    });
  }

  // ── Render (routing only) ──────────────────────────────────────

  render() {
    switch (this.errorType) {
      case 'Timeout':
        return this._renderTimeout();
      case 'SessionExpired':
        return this._renderSessionExpired();
      case 'SomethingWentWrong':
      default:
        return this._renderSomethingWentWrong();
    }
  }
}
