// @ts-check
import { LitElement, html, css } from 'lit';
import { colorTokens } from '../../tokens.js';

/**
 * holdcard-success-screen — shown after a hold or unhold action completes.
 */
export class HoldcardSuccessScreen extends LitElement {
  static get properties() {
    return {
      transactionType: { type: String },
    };
  }

  constructor() {
    super();
    /** @type {import('../../types.js').TransactionType | null} */
    this.transactionType = null;
  }

  static get styles() {
    return [
      colorTokens,
      css`
        :host { display: block; text-align: center; padding: 24px 0; }
        .icon { font-size: 48px; color: var(--color-active, #2e7d32); margin-bottom: 16px; }
        h2 { margin: 0 0 8px 0; font-size: 20px; }
        p  { margin: 0; color: var(--color-text-muted, #666); font-size: 14px; }
      `,
    ];
  }

  render() {
    const isHeld = this.transactionType === 'held';

    return html`
      <div class="icon" aria-hidden="true">✓</div>
      <h2>Card successfully ${isHeld ? 'put on hold' : 'reactivated'}</h2>
      <p>
        ${isHeld
          ? 'Your card is now frozen and cannot be used for new transactions.'
          : 'Your card is active and ready to be used again.'}
      </p>
    `;
  }
}

customElements.define('holdcard-success-screen', HoldcardSuccessScreen);
