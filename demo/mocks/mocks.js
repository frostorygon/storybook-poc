import activeCard from './api/cards/active.js';
import onHoldCard from './api/cards/on-hold.js';
import holdOk from './api/cards/hold/ok.js';
import unholdOk from './api/cards/unhold/ok.js';

// prettier-ignore
export default {
  '/api/v1/cards/:cardId': { ok: activeCard, onHold: onHoldCard },
  '/api/v1/cards/:cardId/hold': { ok: holdOk },
  '/api/v1/cards/:cardId/unhold': { ok: unholdOk },
};
