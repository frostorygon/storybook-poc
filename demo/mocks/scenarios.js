/**
 * @fileoverview Mock scenarios using @web/mocks.
 *
 * `defaults` — happy-path handlers for dev server / baseline stories.
 * Named exports — individual handlers for per-story or per-test overrides.
 *
 * Both stories/ and test/ import from this single file.
 */
import { http } from '@web/mocks/http.js';
import mocks from './mocks.js';

// ── Helpers ────────────────────────────────────────────────────────

/** @param {object} data @param {{ status?: number }} [opts] */
const json = (data, { status = 200 } = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

// ── API Paths ──────────────────────────────────────────────────────

const CARD_URL = '/api/v1/cards/:cardId';
const HOLD_URL = `${CARD_URL}/hold`;
const UNHOLD_URL = `${CARD_URL}/unhold`;

// ── Defaults (happy path) ──────────────────────────────────────────

export default {
  defaults: [
    http.get(CARD_URL, () => json(mocks[CARD_URL].ok)),
    http.post(HOLD_URL, () => json(mocks[HOLD_URL].ok)),
    http.post(UNHOLD_URL, () => json(mocks[UNHOLD_URL].ok)),
  ],
  // Provide additional commonly used mock scenarios:
  // error: [
  //   http.post(HOLD_URL, () => new Response('', { status: 500 })),
  // ],
};

// ── Individual handlers (for per-story / per-test overrides) ───────

// GET card
export const getCard = http.get(CARD_URL, () => json(mocks[CARD_URL].ok));
export const getCardOnHold = http.get(CARD_URL, () => json(mocks[CARD_URL].onHold));
export const getCardGenericError = http.get(CARD_URL, () => json({ errorCode: 'GENERIC_ERROR' }, { status: 500 }));
export const getCardTimeout = http.get(CARD_URL, () => json({ errorCode: 'TIMEOUT' }, { status: 504 }));
export const getCardSessionExpired = http.get(CARD_URL, () => json({ errorCode: 'SESSION_EXPIRED' }, { status: 401 }));

// POST hold
export const holdCard = http.post(HOLD_URL, () => json(mocks[HOLD_URL].ok));
export const holdCardGenericError = http.post(HOLD_URL, () => json({ errorCode: 'GENERIC_ERROR' }, { status: 500 }));
export const holdCardTimeout = http.post(HOLD_URL, () => json({ errorCode: 'TIMEOUT' }, { status: 504 }));
export const holdCardSessionExpired = http.post(HOLD_URL, () => json({ errorCode: 'SESSION_EXPIRED' }, { status: 401 }));

// POST unhold
export const unholdCard = http.post(UNHOLD_URL, () => json(mocks[UNHOLD_URL].ok));
export const unholdCardGenericError = http.post(UNHOLD_URL, () => json({ errorCode: 'GENERIC_ERROR' }, { status: 500 }));
export const unholdCardTimeout = http.post(UNHOLD_URL, () => json({ errorCode: 'TIMEOUT' }, { status: 504 }));
export const unholdCardSessionExpired = http.post(UNHOLD_URL, () => json({ errorCode: 'SESSION_EXPIRED' }, { status: 401 }));

// ── Re-export response data for test assertions ───────────────────

export { default as activeCardResponse } from './api/cards/active.js';
export { default as onHoldCardResponse } from './api/cards/on-hold.js';
export { default as holdSuccessResponse } from './api/cards/hold/ok.js';
export { default as unholdSuccessResponse } from './api/cards/unhold/ok.js';
