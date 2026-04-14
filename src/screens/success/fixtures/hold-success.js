/**
 * Fixture: POST /api/v1/cards/{cardId}/hold
 * Scenario: Card successfully put on hold
 * @type {{ transactionType: import('../../../types.js').TransactionType }}
 */
export const holdSuccess = {
  transactionType: 'held',
};
