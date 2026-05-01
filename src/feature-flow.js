// @ts-check
import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { LitElement, html } from 'lit';
import { HoldcardToggleScreen } from './screens/toggle/index.js';
import { StatusErrorScreen } from './components/screens/status-error-screen/index.js';
import { StatusSuccessScreen } from './components/screens/status-success-screen/index.js';
import { SessionExpiredErrorScreen } from './screens/error/session-expired/index.js';
import { HoldcardService } from './services/holdcard-service.js';
import { styles } from './feature-flow.styles.js';

const FLOW_FIXTURES = {
  ERRORS: {
    TIMEOUT: {
      title: 'Request timed out',
      description: 'The request took too long. Please try again.',
      actionLabel: 'Try Again',
    },
    GENERIC_ERROR: {
      title: 'Something went wrong',
      description: "We couldn't process your request. Please try again later.",
      actionLabel: 'Try Again',
    }
  },
  SUCCESS: {
    held: {
      title: 'Card successfully put on hold',
      description: 'Your card is now frozen and cannot be used for new transactions.',
      actionLabel: 'Back to overview',
    },
    unheld: {
      title: 'Card successfully reactivated',
      description: 'Your card is active and ready to be used again.',
      actionLabel: 'Back to overview',
    }
  }
};

/**
 * feature-flow — orchestrates the full Temporary Holdcard user journey.
 *
 * Manages the three-step flow: toggle → success | error → (retry → toggle).
 * Delegates all API calls to HoldcardService, which is injected as a property
 * so that tests can substitute a mock without patching globals.
 *
 * @typedef {Object} FeatureFlowState
 * @property {string | undefined} cardId
 * @property {import('./types.js').CardStatus} cardStatus
 * @property {string | undefined} accountHolder
 * @property {InstanceType<typeof HoldcardService>} service
 * @property {'toggle' | 'success' | 'error'} _currentStep
 * @property {import('./types.js').TransactionType | undefined} _transactionType
 * @property {import('./types.js').ErrorContext | null} _errorContext
 * @property {boolean} _isLoading
 */

export class FeatureFlow extends ScopedElementsMixin(LitElement) {
  static get scopedElements() {
    return {
      'holdcard-toggle-screen': HoldcardToggleScreen,
      'status-error-screen': StatusErrorScreen,
      'status-success-screen': StatusSuccessScreen,
      'session-expired-error-screen': SessionExpiredErrorScreen,
    };
  }

  static get properties() {
    return {
      cardId: { type: String },
      cardStatus: { type: String },
      accountHolder: { type: String },
      service: { type: Object },
      _currentStep: { type: String, state: true },
      _transactionType: { type: String, state: true },
      _errorContext: { type: Object, state: true },
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
    /** @type {'toggle' | 'success' | 'error'} */
    this._currentStep = 'toggle';
    /** @type {import('./types.js').TransactionType | undefined} */
    this._transactionType = undefined;
    /** @type {import('./types.js').ErrorContext | null} */
    this._errorContext = null;
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
      const result = action === 'hold'
        ? await this.service.holdCard(this.cardId ?? '')
        : await this.service.unholdCard(this.cardId ?? '');

      this._transactionType = result.transactionType;
      this.cardStatus = action === 'hold' ? 'on-hold' : 'active';
      this._currentStep = 'success';
    } catch (err) {
      // err is already a normalised ErrorContext from HoldcardService._normalizeError()
      this._errorContext = /** @type {import('./types.js').ErrorContext} */ (err);
      this._currentStep = 'error';
    } finally {
      this._isLoading = false;
      this._moveFocusToContent();
    }
  }

  _handleRetry() {
    this._currentStep = 'toggle';
    this._errorContext = null;
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

  _renderSuccessScreen() {
    // Using Fixtures for basic text changes (avoiding redundant web component files)
    const transactionType = this._transactionType === 'held' ? 'held' : 'unheld';
    const fixture = FLOW_FIXTURES.SUCCESS[transactionType];

    return html`
      <status-success-screen
        .successTitle=${fixture.title}
        .successMessage=${fixture.description}
        .dismissLabel=${fixture.actionLabel}
        @dismiss="${this._handleDismiss}"
      ></status-success-screen>
    `;
  }

  _renderErrorScreen() {
    const code = this._errorContext?.errorCode;

    // The Smart Component intercept
    // We separate this into a physical component file because it handles unique domain logic (Auth Redirects)
    if (code === 'SESSION_EXPIRED') {
      return html`<session-expired-error-screen></session-expired-error-screen>`;
    }

    // Using Fixtures for generic text changes
    const fixture = FLOW_FIXTURES.ERRORS[code] || FLOW_FIXTURES.ERRORS.GENERIC_ERROR;

    return html`
      <status-error-screen
        .errorTitle=${fixture.title}
        .errorMessage=${fixture.description}
        .retryLabel=${fixture.actionLabel}
        ?retryable=${this._errorContext?.retryable ?? true}
        @retry="${this._handleRetry}"
        @dismiss="${this._handleDismiss}"
      ></status-error-screen>
    `;
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
        ${this._currentStep === 'success' ? this._renderSuccessScreen() : ''}
        ${this._currentStep === 'error' ? this._renderErrorScreen() : ''}
      </div>
    `;
  }
}

customElements.define('feature-flow', FeatureFlow);
