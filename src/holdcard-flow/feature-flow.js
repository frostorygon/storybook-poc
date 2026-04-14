// @ts-check
import { LitElement, html, css } from 'lit';
import '../screens/toggle/holdcard-toggle-screen.js';
import '../screens/error/holdcard-error-screen.js';
import '../screens/success/holdcard-success-screen.js';
import { HoldcardService } from './holdcard-service.js';

/**
 * feature-flow — orchestrates the full Temporary Holdcard user journey.
 *
 * Manages the three-step flow: toggle → success | error → (retry → toggle).
 * Delegates all API calls to HoldcardService, which is injected as a property
 * so that tests can substitute a mock without patching globals.
 *
 * @typedef {Object} FeatureFlowState
 * @property {string | undefined} cardId
 * @property {import('../types.js').CardStatus} cardStatus
 * @property {string | undefined} accountHolder
 * @property {InstanceType<typeof HoldcardService>} service
 * @property {string | null} mockErrorMode
 * @property {'toggle' | 'success' | 'error'} _currentStep
 * @property {import('../types.js').TransactionType | undefined} _transactionType
 * @property {import('../types.js').ErrorContext | null} _errorContext
 * @property {boolean} _isLoading
 */

export class FeatureFlow extends LitElement {
  static get properties() {
    return {
      cardId:           { type: String },
      cardStatus:       { type: String },
      accountHolder:    { type: String },
      service:          { type: Object },
      mockErrorMode:    { type: String },
      _currentStep:     { type: String,  state: true },
      _transactionType: { type: String,  state: true },
      _errorContext:    { type: Object,  state: true },
      _isLoading:       { type: Boolean, state: true },
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
        font-family: Arial, sans-serif;
        max-width: 480px;
        margin: 0 auto;
        border: 1px solid #ccc;
        border-radius: 8px;
        overflow: hidden;
      }
      .header {
        background-color: var(--color-brand, #ff6200);
        color: white;
        padding: 16px;
        font-weight: bold;
        text-align: center;
      }
      .content {
        padding: 24px;
        background-color: var(--color-bg, #f5f5f5);
        min-height: 300px;
      }
    `;
  }

  constructor() {
    super();
    /** @type {string | undefined} */
    this.cardId = undefined;
    /** @type {import('../types.js').CardStatus} */
    this.cardStatus = 'active';
    /** @type {string | undefined} */
    this.accountHolder = undefined;
    /** @type {InstanceType<typeof HoldcardService>} */
    this.service = new HoldcardService();
    /** @type {string | null} */
    this.mockErrorMode = null;
    /** @type {'toggle' | 'success' | 'error'} */
    this._currentStep = 'toggle';
    /** @type {import('../types.js').TransactionType | undefined} */
    this._transactionType = undefined;
    /** @type {import('../types.js').ErrorContext | null} */
    this._errorContext = null;
    /** @type {boolean} */
    this._isLoading = false;
  }

  /**
   * @param {CustomEvent<{ action: import('../types.js').CardAction }>} e
   */
  async _handleAction(e) {
    const action = e.detail.action;
    this._isLoading = true;

    // Storybook mock mode — bypasses real fetch so flow stories work without a backend
    if (this.mockErrorMode) {
      await new Promise((r) => setTimeout(r, 500));
      this._isLoading = false;
      this._errorContext = this._getMockError(this.mockErrorMode);
      this._currentStep = 'error';
      return;
    }

    try {
      const result = action === 'hold'
        ? await this.service.holdCard(this.cardId ?? '')
        : await this.service.unholdCard(this.cardId ?? '');

      this._transactionType = result.transactionType;
      this.cardStatus = action === 'hold' ? 'on-hold' : 'active';
      this._currentStep = 'success';
    } catch (err) {
      // err is already a normalised ErrorContext from HoldcardService._normalizeError()
      this._errorContext = /** @type {import('../types.js').ErrorContext} */ (err);
      this._currentStep = 'error';
    } finally {
      this._isLoading = false;
    }
  }

  _handleRetry() {
    this._currentStep = 'toggle';
    this._errorContext = null;
  }

  /**
   * @param {'GENERIC_ERROR' | 'TIMEOUT' | 'SESSION_EXPIRED'} mode
   * @returns {import('../types.js').ErrorContext}
   */
  _getMockError(mode) {
    /** @type {Record<string, import('../types.js').ErrorContext>} */
    const mocks = {
      TIMEOUT:         { errorCode: 'TIMEOUT',         errorTitle: 'Request timed out',    errorMessage: 'The request took too long. Please try again.',                retryable: true  },
      SESSION_EXPIRED: { errorCode: 'SESSION_EXPIRED', errorTitle: 'Session expired',       errorMessage: 'Your session has expired. Please log in again.',             retryable: false },
      GENERIC_ERROR:   { errorCode: 'GENERIC_ERROR',   errorTitle: 'Something went wrong', errorMessage: "We couldn't process your request. Please try again later.",   retryable: true  },
    };
    return mocks[mode] ?? mocks['GENERIC_ERROR'];
  }

  render() {
    return html`
      <div class="header">Card Management</div>
      <div class="content">
        ${this._currentStep === 'toggle' ? html`
          <holdcard-toggle-screen
            .cardStatus=${this.cardStatus}
            .accountHolder=${this.accountHolder}
            ?isLoading=${this._isLoading}
            @action="${this._handleAction}">
          </holdcard-toggle-screen>
        ` : ''}
        ${this._currentStep === 'success' ? html`
          <holdcard-success-screen
            .transactionType=${this._transactionType}>
          </holdcard-success-screen>
        ` : ''}
        ${this._currentStep === 'error' ? html`
          <holdcard-error-screen
            .errorContext=${this._errorContext}
            @retry="${this._handleRetry}">
          </holdcard-error-screen>
        ` : ''}
      </div>
    `;
  }
}

customElements.define('feature-flow', FeatureFlow);
