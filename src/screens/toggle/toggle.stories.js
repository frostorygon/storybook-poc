import { html } from 'lit';
import './holdcard-toggle-screen.js';
import { defaultActive } from './fixtures/default-active.js';
import { defaultOnHold } from './fixtures/default-on-hold.js';
import { errorResponse } from './fixtures/error.js';

export default {
  title: 'Screens / Toggle Screen',
  component: 'holdcard-toggle-screen',
};

// Exploratory — args enabled for frontend to tweak
export const DefaultActive = {
  name:'Default - Active',
  args:{
    ...defaultActive,
    cardId:"HAHAHA",
    cardType:"credit",
    maskedNumber:"**** **** **** 4564",
    accountHolder:"HAHAHA"
  },
  parameters: {
    mockData: [
      {
        url: '/api/v1/cards/HAHAHA',
        method: 'GET',
        status: 200,
        response: defaultActive,
      },
    ],
  },
  render:(args) => html`<holdcard-toggle-screen .cardStatus=${args.cardStatus} .accountHolder=${args.accountHolder}></holdcard-toggle-screen>`,
};

export const DefaultOnHold = {
  name: 'Default - On Hold',
  args: { ...defaultOnHold },
  parameters: {
    mockData: [
      {
        url: '/api/v1/cards/*',
        method: 'GET',
        status: 200,
        response: defaultOnHold,
      },
    ],
  },
  render: (args) => html`<holdcard-toggle-screen .cardStatus=${args.cardStatus} .accountHolder=${args.accountHolder}></holdcard-toggle-screen>`,
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
  args: { ...errorResponse },
  argTypes: {
    errorCode: { control: false },
    errorMessage: { control: false },
  },
  render: () => html`<holdcard-toggle-screen error></holdcard-toggle-screen>`,
};
