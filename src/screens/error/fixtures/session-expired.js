/**
 * Fixture: Any API call → 401 Unauthorized (session expired)
 * @type {import('../../../types.js').ErrorContext}
 */
export const sessionExpiredError = {
  errorCode: 'SESSION_EXPIRED',
  errorTitle: 'Session expired',
  errorMessage: 'Your session has expired. Please log in again.',
  retryable: false,
};
