/**
 * Fixture: GET /api/v1/cards/{cardId}
 * Scenario: Card is currently on hold
 * @type {import('../../../types.js').CardData & { holdDate: string }}
 */
export const defaultOnHold = {
  cardId: 'CARD-1234-5678-9012',
  cardStatus: 'on-hold',
  cardType: 'debit',
  maskedNumber: '**** **** **** 4567',
  accountHolder: 'Jan de Vries',
  holdDate: '2026-04-10T14:30:00Z',
};
