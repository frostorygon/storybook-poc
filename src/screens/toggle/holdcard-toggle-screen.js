// @ts-check
import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { LitElement } from 'lit';
import { LionButton } from '@lion/ui/button.js';
import { template } from './holdcard-toggle-screen.template.js';
import { styles } from './holdcard-toggle-screen.styles.js';

/**
 * holdcard-toggle-screen — shows the current card state and a hold/unhold action.
 *
 * @fires {CustomEvent<{ action: import('../../types.js').CardAction }>} action
 */
export class HoldcardToggleScreen extends ScopedElementsMixin(LitElement) {
  static get scopedElements() {
    return {
      'lion-button': LionButton,
    };
  }

  static get properties() {
    return {
      cardStatus:    { type: String },
      accountHolder: { type: String },
      maskedNumber:  { type: String },
      isLoading:     { type: Boolean },
      error:         { type: Boolean },
    };
  }

  constructor() {
    super();
    /** @type {import('../../types.js').CardStatus} */
    this.cardStatus = 'active';
    /** @type {string | undefined} */
    this.accountHolder = undefined;
    /** @type {string | undefined} */
    this.maskedNumber = undefined;
    /** @type {boolean} */
    this.isLoading = false;
    /** @type {boolean} */
    this.error = false;
  }

  static get styles() {
    return styles;
  }

  _onAction() {
    this.dispatchEvent(new CustomEvent('action', {
      detail: { action: this.cardStatus === 'active' ? 'hold' : 'unhold' },
      bubbles: true,
      composed: true,
    }));
  }

  render() {
    return template({
      cardStatus: this.cardStatus,
      accountHolder: this.accountHolder,
      maskedNumber: this.maskedNumber,
      isLoading: this.isLoading,
      error: this.error,
      onAction: () => this._onAction(),
    });
  }
}
