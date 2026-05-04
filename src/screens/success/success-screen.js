// @ts-check
import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { LitElement } from 'lit';
import { StatusSuccessScreen } from '../../components/screens/status-success-screen/index.js';
import { templateHeld, templateUnheld } from './success-screen.template.js';
import { styles } from './success-screen.styles.js';

/**
 * @typedef {'Held' | 'Unheld'} SuccessType
 */

/**
 * success-screen
 *
 * Single screen component for all success variants.
 *
 * @fires {CustomEvent} dismiss - when the user dismisses the success feedback
 */
export class SuccessScreen extends ScopedElementsMixin(LitElement) {
  static get scopedElements() {
    return {
      'status-success-screen': StatusSuccessScreen,
    };
  }

  static get properties() {
    return {
      successType: { type: String, attribute: 'success-type' },
    };
  }

  static get styles() {
    return styles;
  }

  constructor() {
    super();
    /** @type {SuccessType} */
    this.successType = 'Held';
  }

  _onDismiss() {
    this.dispatchEvent(new CustomEvent('dismiss', { bubbles: true, composed: true }));
  }

  render() {
    switch (this.successType) {
      case 'Unheld':
        return templateUnheld({
          onDismiss: () => this._onDismiss(),
        });
      case 'Held':
      default:
        return templateHeld({
          onDismiss: () => this._onDismiss(),
        });
    }
  }
}
