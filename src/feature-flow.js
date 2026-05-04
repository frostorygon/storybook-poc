// @ts-check
import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { LitElement, html } from 'lit';
import { HoldcardToggleScreen } from './screens/toggle/index.js';
import { ErrorScreen } from './screens/error/index.js';
import { SuccessScreen } from './screens/success/index.js';
import { HoldcardService } from './services/holdcard-service.js';
import { styles } from './feature-flow.styles.js';

/**
 * Error code → ErrorType mapping.
 * Unknown error codes fall back to 'SomethingWentWrong'.
 * @type {Record<string, import('./screens/error/error-screen.js').ErrorType>}
 */
const ERROR_TYPE_MAP = {
  SESSION_EXPIRED: 'SessionExpired',
  TIMEOUT: 'Timeout',
};

/**
 * feature-flow — orchestrates the full Temporary Holdcard user journey.
 *
 * A thin router / state machine. Delegates all API calls to HoldcardService
 * (injected as a property) and renders variant-driven screen components based
 * on the current step. Each screen owns its own copy and behavior internally.
 *
 * @typedef {'toggle' | 'error' | 'success'} FlowStep
 */
export class FeatureFlow extends ScopedElementsMixin(LitElement) {
  static get scopedElements() {
    return {
      'holdcard-toggle-screen': HoldcardToggleScreen,
      'error-screen': ErrorScreen,
      'success-screen': SuccessScreen,
    };
  }

  static get properties() {
    return {
      cardId: { type: String },
      cardStatus: { type: String },
      accountHolder: { type: String },
      service: { type: Object },
      _currentStep: { type: String, state: true },
      _errorType: { type: String, state: true },
      _successType: { type: String, state: true },
      _isLoading: { type: Boolean, state: true },
    };
  }

  static get styles() {
    return styles;
  }

  constructor() {
    super();
    /** @type {string | undefined} */
    this.cardId = undefined;
    /** @type {import('./types.js').CardStatus} */
    this.cardStatus = 'active';
    /** @type {string | undefined} */
    this.accountHolder = undefined;
    /** @type {InstanceType<typeof HoldcardService>} */
    this.service = new HoldcardService();
    /** @type {FlowStep} */
    this._currentStep = 'toggle';
    /** @type {import('./screens/error/error-screen.js').ErrorType} */
    this._errorType = 'SomethingWentWrong';
    /** @type {import('./screens/success/success-screen.js').SuccessType} */
    this._successType = 'Held';
    /** @type {boolean} */
    this._isLoading = false;
  }

  /**
   * @param {CustomEvent<{ action: import('./types.js').CardAction }>} e
   */
  async _handleAction(e) {
    const action = e.detail.action;
    this._isLoading = true;

    try {
      action === 'hold'
        ? await this.service.holdCard(this.cardId ?? '')
        : await this.service.unholdCard(this.cardId ?? '');

      this.cardStatus = action === 'hold' ? 'on-hold' : 'active';
      this._successType = action === 'hold' ? 'Held' : 'Unheld';
      this._currentStep = 'success';
    } catch (err) {
      const errorCode = /** @type {import('./types.js').ErrorContext} */ (err).errorCode;
      this._errorType = ERROR_TYPE_MAP[errorCode] || 'SomethingWentWrong';
      this._currentStep = 'error';
    } finally {
      this._isLoading = false;
      this._moveFocusToContent();
    }
  }

  _handleRetry() {
    this._currentStep = 'toggle';
    this._moveFocusToContent();
  }

  _handleDismiss() {
    // In a real app, this would route back to the dashboard or dismiss a modal
    console.log('Flow dismissed');
    this._currentStep = 'toggle';
    this._moveFocusToContent();
  }

  _handleAuthRedirect() {
    // In a real app, this would integrate with the auth service
    console.log('Auth redirect requested');
  }

  /** Move focus to the content container after a screen transition (a11y). */
  async _moveFocusToContent() {
    await this.updateComplete;
    const content = this.shadowRoot?.querySelector('.content');
    if (content instanceof HTMLElement) {
      content.setAttribute('tabindex', '-1');
      content.focus();
    }
  }

  /** @returns {import('lit').TemplateResult} */
  _renderStep() {
    switch (this._currentStep) {
      case 'toggle':
        return html`
          <holdcard-toggle-screen
            .cardStatus=${this.cardStatus}
            .accountHolder=${this.accountHolder}
            ?isLoading=${this._isLoading}
            @action="${this._handleAction}">
          </holdcard-toggle-screen>`;
      case 'error':
        return html`
          <error-screen
            error-type="${this._errorType}"
            @retry="${this._handleRetry}"
            @dismiss="${this._handleDismiss}"
            @auth-redirect="${this._handleAuthRedirect}">
          </error-screen>`;
      case 'success':
        return html`
          <success-screen
            success-type="${this._successType}"
            @dismiss="${this._handleDismiss}">
          </success-screen>`;
      default:
        return html``;
    }
  }

  render() {
    return html`
      <div class="header">Card Management</div>
      <div class="content">
        ${this._renderStep()}
      </div>
    `;
  }
}

customElements.define('feature-flow', FeatureFlow);
