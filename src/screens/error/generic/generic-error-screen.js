// @ts-check
import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { LitElement } from 'lit';
import { StatusErrorScreen } from '../../../components/screens/status-error-screen/index.js';
import { template } from './generic-error-screen.template.js';
import { styles } from './generic-error-screen.styles.js';

/**
 * generic-error-screen
 *
 * Self-contained error screen for generic/unclassified API failures.
 * Wraps status-error-screen with hardcoded copy. Retryable.
 *
 * @fires {CustomEvent} retry - when the retry action is clicked
 * @fires {CustomEvent} dismiss - when the dismiss action is clicked
 */
export class GenericErrorScreen extends ScopedElementsMixin(LitElement) {
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
