import { html } from 'lit';
import '../../../screens/error/holdcard-error-screen.js';
import { genericError } from '../../../screens/error/fixtures/generic.js';
import { timeoutError } from '../../../screens/error/fixtures/timeout.js';
import { sessionExpiredError } from '../../../screens/error/fixtures/session-expired.js';

export default {
  title: 'Screens / Error',
  component: 'holdcard-error-screen',
};

export const DefaultGeneric = {
  name: 'Default - Generic',
  parameters: {
    mockData: [
      {
        url: '/api/v1/cards/*/hold',
        method: 'POST',
        status: 500,
        response: genericError,
      },
    ],
  },
  render: () => html`<holdcard-error-screen .errorContext=${genericError}></holdcard-error-screen>`
};

export const DefaultTimeout = {
  name: 'Default - Timeout',
  parameters: {
    mockData: [
      {
        url: '/api/v1/cards/*/hold',
        method: 'POST',
        status: 408,
        response: timeoutError,
      },
    ],
  },
  render: () => html`<holdcard-error-screen .errorContext=${timeoutError}></holdcard-error-screen>`
};

export const DefaultSessionExpired = {
  name: 'Default - Session Expired',
  parameters: {
    mockData: [
      {
        url: '/api/v1/cards/*/hold',
        method: 'POST',
        status: 401,
        response: sessionExpiredError,
      },
    ],
  },
  render: () => html`<holdcard-error-screen .errorContext=${sessionExpiredError}></holdcard-error-screen>`
};
