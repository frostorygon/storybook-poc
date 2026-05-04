// @ts-check
import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { LitElement } from 'lit';
import { StatusSuccessScreen } from '../../../components/screens/status-success-screen/index.js';
import { template } from './hold-success-screen.template.js';
import { styles } from './hold-success-screen.styles.js';

/**
 * hold-success-screen
 *
 * Self-contained success screen shown after a card hold action completes.
 * Wraps status-success-screen with hardcoded copy.
 *
 * @fires {CustomEvent} dismiss - when the dismiss action is clicked
 */
export class HoldSuccessScreen extends ScopedElementsMixin(LitElement) {
  static get scopedElements() {
    return {
      'status-success-screen': StatusSuccessScreen,
    };
  }

  static get styles() {
    return styles;
  }

  _onDismiss() {
    this.dispatchEvent(new CustomEvent('dismiss', { bubbles: true, composed: true }));
  }

  render() {
    return template({
      onDismiss: () => this._onDismiss(),
    });
  }
}
