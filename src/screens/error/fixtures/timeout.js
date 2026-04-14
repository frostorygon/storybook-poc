/**
 * Fixture: Any API call → request timeout (408/504)
 * @type {import('../../../types.js').ErrorContext}
 */
export const timeoutError = {
  errorCode: 'TIMEOUT',
  errorTitle: 'Request timed out',
  errorMessage: 'The request took too long. Please check your connection and try again.',
  retryable: true,
};
