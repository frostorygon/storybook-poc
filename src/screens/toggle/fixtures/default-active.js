/**
 * Fixture: GET /api/v1/cards/{cardId}
 * Scenario: Card is currently active
 * @type {import('../../../types.js').CardData}
 */
export const defaultActive = {
  cardId: 'CARD-1234-5678-9012',
  cardStatus: 'active',
  cardType: 'debit',
  maskedNumber: '**** **** **** 4567',
  accountHolder: 'Jan de Vries',
};
