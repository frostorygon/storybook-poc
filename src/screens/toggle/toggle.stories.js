import { html } from 'lit';
import { HoldcardToggleScreen } from './holdcard-toggle-screen.js';
import { defaultActive, defaultOnHold } from '../../mocks/fixtures.js';

customElements.define('holdcard-toggle-screen', HoldcardToggleScreen);

export default {
  title: 'Screens / Toggle Screen',
  component: 'holdcard-toggle-screen',
};

export const DefaultActive = {
  name: 'Default - Active',
  args: {
    ...defaultActive,
  },
  parameters: {
    mockData: [
      {
        url: `/api/v1/cards/${defaultActive.cardId}`,
        method: 'GET',
        status: 200,
        response: defaultActive,
      },
    ],
  },
  render: (args) => html`
    <holdcard-toggle-screen
      .cardStatus=${args.cardStatus}
      .accountHolder=${args.accountHolder}
      .maskedNumber=${args.maskedNumber}
    ></holdcard-toggle-screen>
  `,
};

export const DefaultOnHold = {
  name: 'Default - On Hold',
  args: {
    ...defaultOnHold,
  },
  parameters: {
    mockData: [
      {
        url: `/api/v1/cards/${defaultOnHold.cardId}`,
        method: 'GET',
        status: 200,
        response: defaultOnHold,
      },
    ],
  },
  render: (args) => html`
    <holdcard-toggle-screen
      .cardStatus=${args.cardStatus}
      .accountHolder=${args.accountHolder}
      .maskedNumber=${args.maskedNumber}
    ></holdcard-toggle-screen>
  `,
};

// Fixed — visual regression targets
export const Loading = {
  name: 'Loading',
  args: { isLoading: true },
  argTypes: { isLoading: { control: false } },
  render: () => html`<holdcard-toggle-screen isLoading></holdcard-toggle-screen>`,
};

export const Error = {
  name: 'Error',
  args: { error: true },
  argTypes: { error: { control: false } },
  render: () => html`<holdcard-toggle-screen error></holdcard-toggle-screen>`,
};
