// @ts-check
import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { LitElement } from 'lit';
import { LionButton } from '@lion/ui/button.js';
import { template } from './status-success-screen.template.js';
import { styles } from './status-success-screen.styles.js';
import { StatusScreenLayout } from '../../layout/status-screen-layout/index.js';

/**
 * status-success-screen — Reusable success feedback screen.
 *
 * Accepts flat props. The consuming flow provides the copy.
 *
 * @fires {CustomEvent} dismiss - when the dismiss action is clicked
 */
export class StatusSuccessScreen extends ScopedElementsMixin(LitElement) {
  static get scopedElements() {
    return {
      'status-screen-layout': StatusScreenLayout,
      'lion-button': LionButton,
    };
  }

  static get properties() {
    return {
      successTitle:   { type: String },
      successMessage: { type: String },
      dismissLabel:   { type: String },
    };
  }

  constructor() {
    super();
    /** @type {string} */
    this.successTitle = '';
    /** @type {string} */
    this.successMessage = '';
    /** @type {string} */
    this.dismissLabel = 'Back to overview';
  }

  static get styles() {
    return styles;
  }

  _onDismiss() {
    this.dispatchEvent(new CustomEvent('dismiss', { bubbles: true, composed: true }));
  }

  render() {
    return template({
      successTitle: this.successTitle,
      successMessage: this.successMessage,
      dismissLabel: this.dismissLabel,
      onDismiss: () => this._onDismiss(),
    });
  }
}
