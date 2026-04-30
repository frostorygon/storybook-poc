// @ts-check
/**
 * @fileoverview Centralized fixtures for the Holdcard feature.
 *
 * All mock API data lives here — one place for backend, QA, and stories
 * to verify the API contract. Individual screen fixtures/ folders are gone.
 *
 * Usage:
 *   import { genericError, holdSuccess } from '../../mocks/fixtures.js';
 */

// ─── Toggle Screen Fixtures ─────────────────────────────────────────

/** @type {import('../types.js').CardData} */
export const defaultActive = {
  cardId: 'CARD-1234-5678-9012',
  cardStatus: 'active',
  maskedNumber: '**** **** **** 4567',
  accountHolder: 'Jan de Vries',
};

/** @type {import('../types.js').CardData & { holdDate: string }} */
export const defaultOnHold = {
  cardId: 'CARD-1234-5678-9012',
  cardStatus: 'on-hold',
  maskedNumber: '**** **** **** 4567',
  accountHolder: 'Jan de Vries',
  holdDate: '2025-04-10T14:30:00Z',
};

/** @type {{ errorCode: string, errorMessage: string }} */
export const errorResponse = {
  errorCode: 'FETCH_FAILED',
  errorMessage: 'Unable to retrieve card information. Please try again.',
};

// ─── Error Screen Fixtures ──────────────────────────────────────────

/** @type {import('../types.js').ErrorContext} */
export const genericError = {
  errorCode: 'GENERIC_ERROR',
  retryable: true,
};

/** @type {import('../types.js').ErrorContext} */
export const timeoutError = {
  errorCode: 'TIMEOUT',
  retryable: true,
};

/** @type {import('../types.js').ErrorContext} */
export const sessionExpiredError = {
  errorCode: 'SESSION_EXPIRED',
  retryable: false,
};

// ─── Success Screen Fixtures ────────────────────────────────────────

/** @type {{ transactionType: import('../types.js').TransactionType }} */
export const holdSuccess = {
  transactionType: 'held',
};

/** @type {{ transactionType: import('../types.js').TransactionType }} */
export const unholdSuccess = {
  transactionType: 'unheld',
};
