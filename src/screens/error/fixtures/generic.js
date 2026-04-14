/**
 * Fixture: Any API call → generic server error
 * @type {import('../../../types.js').ErrorContext}
 */
export const genericError = {
  errorCode: 'GENERIC_ERROR',
  errorTitle: 'Something went wrong',
  errorMessage: "We couldn't process your request. Please try again later.",
  retryable: true,
};
