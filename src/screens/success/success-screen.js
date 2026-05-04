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

  // ── Event handlers ─────────────────────────────────────────────

  _onDismiss() {
    this.dispatchEvent(new CustomEvent('dismiss', { bubbles: true, composed: true }));
  }

  // ── Private render methods (param assembly) ────────────────────

  _renderHeld() {
    return renderHeld({
      onDismiss: () => this._onDismiss(),
    });
  }

  _renderUnheld() {
    return renderUnheld({
      onDismiss: () => this._onDismiss(),
    });
  }

  // ── Render (routing only) ──────────────────────────────────────

  render() {
    switch (this.successType) {
      case 'Unheld':
        return this._renderUnheld();
      case 'Held':
      default:
        return this._renderHeld();
    }
  }
}
