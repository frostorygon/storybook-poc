// @ts-check
import { LitElement, html, css } from 'lit';
import { colorTokens } from '../../tokens.js';
import '@lion/ui/define/lion-button.js';

/**
 * holdcard-toggle-screen — shows the current card state and a hold/unhold action.
 *
 * @fires {CustomEvent<{ action: import('../../types.js').CardAction }>} action
 */
export class HoldcardToggleScreen extends LitElement {
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
    return [
      colorTokens,
      css`
        :host { display: block; text-align: center; }
        .card-preview {
          background: var(--color-surface, #fff);
          border-radius: 8px;
          padding: 24px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          margin-bottom: 24px;
        }
        .card-status {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: bold;
          font-size: 12px;
          text-transform: uppercase;
          margin-bottom: 12px;
        }
        .status-active { background: var(--color-active-bg, #e8f5e9); color: var(--color-active, #2e7d32); }
        .status-hold   { background: var(--color-hold-bg, #ffebee);   color: var(--color-hold, #c62828);   }
        .masked-number { color: var(--color-text-muted, #666); font-size: 14px; letter-spacing: 2px; }
        h2 { margin: 0 0 8px 0; font-size: 18px; }
        p  { margin: 0 0 24px 0; color: var(--color-text-muted, #666); font-size: 14px; }
      `,
    ];
  }

  _onAction() {
    this.dispatchEvent(new CustomEvent('action', {
      detail: { action: this.cardStatus === 'active' ? 'hold' : 'unhold' },
      bubbles: true,
      composed: true,
    }));
  }

  render() {
    if (this.isLoading) {
      return html`<p role="status" aria-live="polite">Loading card details…</p>`;
    }

    if (this.error) {
      return html`
        <p role="alert" style="color: var(--color-hold, red)">
          Failed to load card details. Please try again later.
        </p>
      `;
    }

    const isActive = this.cardStatus === 'active';
    const maskedDisplay = this.maskedNumber ?? '**** **** **** ????';
    const maskedLabel = `Card ending in ${maskedDisplay.slice(-4)}`;

    return html`
      <div class="card-preview">
        <div
          class="card-status ${isActive ? 'status-active' : 'status-hold'}"
          aria-label="Card status: ${isActive ? 'Active' : 'On Hold'}">
          ${isActive ? 'Active' : 'On Hold'}
        </div>
        <h2>${this.accountHolder ?? 'Customer'}</h2>
        <p class="masked-number" aria-label="${maskedLabel}">${maskedDisplay}</p>
      </div>

      <p>
        ${isActive
          ? 'You can temporarily freeze your card if you misplaced it. You can unfreeze it at any time.'
          : 'Your card is currently on hold and cannot be used for transactions.'}
      </p>

      <lion-button @click="${this._onAction}">
        ${isActive ? 'Hold Card' : 'Unhold Card'}
      </lion-button>
    `;
  }
}

customElements.define('holdcard-toggle-screen', HoldcardToggleScreen);
