// @ts-check
import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { LitElement } from 'lit';
import { StatusErrorScreen } from '../../../components/screens/status-error-screen/index.js';
import { template } from './timeout-error-screen.template.js';
import { styles } from './timeout-error-screen.styles.js';

/**
 * timeout-error-screen
 *
 * Self-contained error screen for network timeout failures (408/504).
 * Wraps status-error-screen with hardcoded copy. Retryable.
 *
 * @fires {CustomEvent} retry - when the retry action is clicked
 * @fires {CustomEvent} dismiss - when the dismiss action is clicked
 */
export class TimeoutErrorScreen extends ScopedElementsMixin(LitElement) {
  static get scopedElements() {
    return {
      'status-error-screen': StatusErrorScreen,
    };
  }

  static get styles() {
    return styles;
  }

  _onRetry() {
    this.dispatchEvent(new CustomEvent('retry', { bubbles: true, composed: true }));
  }

  _onDismiss() {
    this.dispatchEvent(new CustomEvent('dismiss', { bubbles: true, composed: true }));
  }

  render() {
    return template({
      onRetry: () => this._onRetry(),
      onDismiss: () => this._onDismiss(),
    });
  }
}
