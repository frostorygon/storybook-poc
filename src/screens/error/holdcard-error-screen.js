// @ts-check
import { LitElement, html, css } from 'lit';
import { colorTokens } from '../../tokens.js';
import '@lion/ui/define/lion-button.js';

/**
 * holdcard-error-screen — shown when a hold/unhold API call fails.
 *
 * @fires {CustomEvent} retry
 */
export class HoldcardErrorScreen extends LitElement {
  static get properties() {
    return {
      errorContext: { type: Object },
    };
  }

  constructor() {
    super();
    /** @type {import('../../types.js').ErrorContext | null} */
    this.errorContext = null;
  }

  static get styles() {
    return [
      colorTokens,
      css`
        :host { display: block; text-align: center; padding: 24px 0; }
        .icon { font-size: 48px; color: var(--color-hold, #c62828); margin-bottom: 16px; }
        h2 { margin: 0 0 8px 0; font-size: 20px; }
        p  { margin: 0 0 24px 0; color: var(--color-text-muted, #666); font-size: 14px; }
      `,
    ];
  }

  _onRetry() {
    this.dispatchEvent(new CustomEvent('retry', { bubbles: true, composed: true }));
  }

  render() {
    if (!this.errorContext) {
      console.error('[holdcard-error-screen] rendered without errorContext — this is a bug in feature-flow');
      return html`
        <div class="icon" aria-hidden="true">⚠</div>
        <h2>An unexpected error occurred</h2>
        <p>Please go back and try again.</p>
      `;
    }

    return html`
      <div class="icon" aria-hidden="true">⚠</div>
      <h2>${this.errorContext.errorTitle}</h2>
      <p>${this.errorContext.errorMessage}</p>
      ${this.errorContext.retryable
        ? html`<lion-button @click="${this._onRetry}">Try Again</lion-button>`
        : html`<lion-button>Back to overview</lion-button>`}
    `;
  }
}

customElements.define('holdcard-error-screen', HoldcardErrorScreen);
