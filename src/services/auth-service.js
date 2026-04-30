export class AuthService {
  /** @type {string} */
  _baseUrl;

  /**
   * @param {string} [baseUrl] - Override base URL for testing (default: relative)
   */
  constructor(baseUrl = '') {
    this._baseUrl = baseUrl;
  }

  /**
   * Fetches the current user's session from the authentication microservice.
   * This is a completely different API domain from the Cards API.
   * 
   * @returns {Promise<{ isAuthenticated: boolean, userId: string }>}
   */
  async getSession() {
    // Calling the Auth microservice (different route from /api/v1/cards)
    const res = await fetch(`${this._baseUrl}/api/v1/auth/session`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      throw this._normalizeError(res.status, await res.json().catch(() => ({})));
    }
    
    return res.json();
  }

  /**
   * Refreshes the JWT token.
   */
  async refreshToken() {
    const res = await fetch(`${this._baseUrl}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      throw this._normalizeError(res.status, await res.json().catch(() => ({})));
    }
    
    return res.json();
  }

  /**
   * Normalizes Auth-specific backend errors into generic UI-friendly contexts.
   */
  _normalizeError(status, payload) {
    if (status === 401 || status === 403) {
      return { errorCode: 'SESSION_EXPIRED', retryable: false };
    }
    if (status >= 500) {
      return { errorCode: 'AUTH_SERVER_ERROR', retryable: true };
    }
    return { errorCode: 'GENERIC_AUTH_ERROR', retryable: true, message: payload.message };
  }
}
