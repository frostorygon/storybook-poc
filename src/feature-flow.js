// @ts-check
import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { LitElement, html } from 'lit';
import { HoldcardToggleScreen } from './screens/toggle/index.js';
import { GenericErrorScreen } from './screens/error/generic/index.js';
import { TimeoutErrorScreen } from './screens/error/timeout/index.js';
import { SessionExpiredErrorScreen } from './screens/error/session-expired/index.js';
import { HoldSuccessScreen } from './screens/success/held/index.js';
import { UnholdSuccessScreen } from './screens/success/unheld/index.js';
import { HoldcardService } from './services/holdcard-service.js';
import { styles } from './feature-flow.styles.js';

/**
 * Error code → step name mapping.
 * Unknown error codes fall back to 'error-generic'.
 * @type {Record<string, string>}
 */
const ERROR_STEP_MAP = {
  SESSION_EXPIRED: 'error-session',
  TIMEOUT: 'error-timeout',
};

/**
 * feature-flow — orchestrates the full Temporary Holdcard user journey.
 *
 * A thin router / state machine. Delegates all API calls to HoldcardService
 * (injected as a property) and renders self-contained screen components based
 * on the current step. Each screen owns its own copy, icons, and behavior.
 *
 * @typedef {'toggle' | 'success-held' | 'success-unheld' | 'error-generic' | 'error-timeout' | 'error-session'} FlowStep
 */
export class FeatureFlow extends ScopedElementsMixin(LitElement) {
  static get scopedElements() {
    return {
      'holdcard-toggle-screen': HoldcardToggleScreen,
      'generic-error-screen': GenericErrorScreen,
      'timeout-error-screen': TimeoutErrorScreen,
      'session-expired-error-screen': SessionExpiredErrorScreen,
      'hold-success-screen': HoldSuccessScreen,
      'unhold-success-screen': UnholdSuccessScreen,
    };
  }

  static get properties() {
    return {
      cardId: { type: String },
      cardStatus: { type: String },
      accountHolder: { type: String },
      service: { type: Object },
      _currentStep: { type: String, state: true },
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
      this._currentStep = action === 'hold' ? 'success-held' : 'success-unheld';
    } catch (err) {
      const errorCode = /** @type {import('./types.js').ErrorContext} */ (err).errorCode;
      this._currentStep = ERROR_STEP_MAP[errorCode] || 'error-generic';
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
      case 'success-held':
        return html`<hold-success-screen @dismiss="${this._handleDismiss}"></hold-success-screen>`;
      case 'success-unheld':
        return html`<unhold-success-screen @dismiss="${this._handleDismiss}"></unhold-success-screen>`;
      case 'error-generic':
        return html`<generic-error-screen @retry="${this._handleRetry}" @dismiss="${this._handleDismiss}"></generic-error-screen>`;
      case 'error-timeout':
        return html`<timeout-error-screen @retry="${this._handleRetry}" @dismiss="${this._handleDismiss}"></timeout-error-screen>`;
      case 'error-session':
        return html`<session-expired-error-screen></session-expired-error-screen>`;
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
