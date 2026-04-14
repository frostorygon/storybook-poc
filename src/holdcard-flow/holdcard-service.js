// @ts-check

/**
 * HoldcardService — wraps all API calls for the Temporary Holdcard feature.
 *
 * Co-located with feature-flow because it exists solely to serve this flow.
 * Injected as a property so tests can substitute a mock without any patching.
 */
export class HoldcardService {
  /** @type {string} */
  _baseUrl;

  /**
   * @param {string} [baseUrl] - Override base URL for testing (default: relative)
   */
  constructor(baseUrl = '') {
    this._baseUrl = baseUrl;
  }

  /**
   * Fetch the current card details.
   * @param {string} cardId
   * @returns {Promise<import('../types.js').CardData>}
   */
  async getCardStatus(cardId) {
    const res = await fetch(`${this._baseUrl}/api/v1/cards/${cardId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw this._normalizeError(res.status, await res.json().catch(() => ({})));
    return res.json();
  }

  /**
   * Put a card on hold.
   * @param {string} cardId
   * @returns {Promise<{ transactionType: 'held' }>}
   */
  async holdCard(cardId) {
    const res = await fetch(`${this._baseUrl}/api/v1/cards/${cardId}/hold`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw this._normalizeError(res.status, await res.json().catch(() => ({})));
    return { transactionType: /** @type {'held'} */ ('held') };
  }

  /**
   * Reactivate a held card.
   * @param {string} cardId
   * @returns {Promise<{ transactionType: 'unheld' }>}
   */
  async unholdCard(cardId) {
    const res = await fetch(`${this._baseUrl}/api/v1/cards/${cardId}/unhold`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw this._normalizeError(res.status, await res.json().catch(() => ({})));
    return { transactionType: /** @type {'unheld'} */ ('unheld') };
  }

  /**
   * Maps HTTP error status codes to a consistent ErrorContext shape.
   * @param {number} status
   * @param {Record<string, unknown>} body
   * @returns {import('../types.js').ErrorContext}
   */
  _normalizeError(status, body) {
    if (status === 401 || status === 403) {
      return { errorCode: 'SESSION_EXPIRED', errorTitle: 'Session expired',    errorMessage: 'Your session has expired. Please log in again.',                  retryable: false };
    }
    if (status === 408 || status === 504) {
      return { errorCode: 'TIMEOUT',         errorTitle: 'Request timed out',  errorMessage: 'The request took too long. Please try again.',                     retryable: true  };
    }
    return {
      errorCode:    String(body?.['errorCode']    ?? 'GENERIC_ERROR'),
      errorTitle:   String(body?.['errorTitle']   ?? 'Something went wrong'),
      errorMessage: String(body?.['errorMessage'] ?? "We couldn't process your request. Please try again later."),
      retryable: true,
    };
  }
}
