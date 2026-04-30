/**
 * @fileoverview Shared JSDoc type definitions for the Holdcard feature.
 *
 * Import in any file with:
 *   @type {import('../../types.js').ErrorContext}
 *
 * Add // @ts-check at the top of a file to enable IDE type checking on it.
 */

/**
 * The status of a card.
 * @typedef {'active' | 'on-hold'} CardStatus
 */

/**
 * Full card data returned by GET /api/v1/cards/{cardId}
 * @typedef {Object} CardData
 * @property {string}     cardId         - e.g. "CARD-1234-5678-9012"
 * @property {CardStatus} cardStatus     - current status of the card
 * @property {string}     maskedNumber   - e.g. "**** **** **** 4567"
 * @property {string}     accountHolder  - e.g. "Jan de Vries"
 */

/**
 * Normalised error shape used by all Holdcard screens.
 * HoldcardService._normalizeError() always produces this shape.
 * @typedef {Object} ErrorContext
 * @property {string}  errorCode      - machine-readable code, e.g. "TIMEOUT"
 * @property {boolean} retryable      - true = show "Try Again", false = show "Back to overview"
 * @property {any}     [originalError] - the raw error for logging purposes
 */

/**
 * Result returned after a successful hold/unhold API call.
 * @typedef {'held' | 'unheld'} TransactionType
 */

/**
 * The user action dispatched by holdcard-toggle-screen.
 * @typedef {'hold' | 'unhold'} CardAction
 */

// export {} makes this file an ES module so `import('...types.js').TypeName`
// works in @ts-check files. Without it TypeScript treats this as a script
// and refuses to resolve @typedef imports from it.
export {};
