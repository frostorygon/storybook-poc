// @ts-check
import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { LitElement } from 'lit';
import { LionButton } from '@lion/ui/button.js';
import { template } from './status-error-screen.template.js';
import { styles } from './status-error-screen.styles.js';
import { StatusScreenLayout } from '../../layout/status-screen-layout/index.js';

/**
 * status-error-screen — Reusable error feedback screen.
 *
 * Accepts flat props (no coupling to any specific error shape).
 * The consuming flow maps its error data to these props.
 *
 * @fires {CustomEvent} retry - when the retry action is clicked
 * @fires {CustomEvent} dismiss - when the dismiss action is clicked
 */
export class StatusErrorScreen extends ScopedElementsMixin(LitElement) {
  static get scopedElements() {
    return {
      'status-screen-layout': StatusScreenLayout,
      'lion-button': LionButton,
    };
  }

  static get properties() {
    return {
      errorTitle:   { type: String },
      errorMessage: { type: String },
      retryable:    { type: Boolean },
      retryLabel:   { type: String },
      dismissLabel: { type: String },
    };
  }

  constructor() {
    super();
    /** @type {string} */
    this.errorTitle = 'Something went wrong';
    /** @type {string} */
    this.errorMessage = '';
    /** @type {boolean} */
    this.retryable = true;
    /** @type {string} */
    this.retryLabel = 'Try Again';
    /** @type {string} */
    this.dismissLabel = 'Back to overview';
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
    return template(this);
  }
}
