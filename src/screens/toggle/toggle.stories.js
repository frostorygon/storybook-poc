import { html } from 'lit';
import { HoldcardToggleScreen } from './holdcard-toggle-screen.js';
import { activeCardResponse, heldCardResponse } from '../../mocks/handlers/cardHandlers.js';

customElements.define('holdcard-toggle-screen', HoldcardToggleScreen);

export default {
  title: 'Screens / Toggle Screen',
  component: 'holdcard-toggle-screen',
};

export const ActiveCard = () => html`
  <holdcard-toggle-screen
    .cardStatus=${activeCardResponse.cardStatus}
    .accountHolder=${activeCardResponse.accountHolder}
    .maskedNumber=${activeCardResponse.maskedNumber}>
  </holdcard-toggle-screen>
`;

export const OnHoldCard = () => html`
  <holdcard-toggle-screen
    .cardStatus=${heldCardResponse.cardStatus}
    .accountHolder=${heldCardResponse.accountHolder}
    .maskedNumber=${heldCardResponse.maskedNumber}>
  </holdcard-toggle-screen>
`;
