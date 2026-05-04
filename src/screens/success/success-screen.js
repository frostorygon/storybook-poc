// @ts-check
import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { LitElement } from 'lit';
import { StatusSuccessScreen } from '../../components/screens/status-success-screen/index.js';
import { renderHeld, renderUnheld } from './success-screen.template.js';
import { styles } from './success-screen.styles.js';

/**
 * @typedef {'Held' | 'Unheld'} SuccessType
 */

/**
 * success-screen
 *
 * Single screen component that handles all success variants via the
 * `successType` property. Each variant has its own render function
 * in the template file.
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
        return renderUnheld(this);
      case 'Held':
      default:
        return renderHeld(this);
    }
  }
}
