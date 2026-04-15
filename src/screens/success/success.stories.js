import { html } from 'lit';
import './holdcard-success-screen.js';
import { holdSuccess } from './fixtures/hold-success.js';
import { unholdSuccess } from './fixtures/unhold-success.js';

export default {
  title: 'Screens / Success Screen',
  component: 'holdcard-success-screen',
};

export const DefaultHold = {
  name: 'Default - Hold',
  parameters: {
    mockData: [
      {
        url: '/api/v1/cards/*/hold',
        method: 'POST',
        status: 200,
        response: holdSuccess,
      },
    ],
  },
  render: () => html`<holdcard-success-screen .transactionType=${holdSuccess.transactionType}></holdcard-success-screen>`
};

export const DefaultUnhold = {
  name: 'Default - Unhold',
  parameters: {
    mockData: [
      {
        url: '/api/v1/cards/*/unhold',
        method: 'POST',
        status: 200,
        response: unholdSuccess,
      },
    ],
  },
  render: () => html`<holdcard-success-screen .transactionType=${unholdSuccess.transactionType}></holdcard-success-screen>`
};
