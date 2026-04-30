import { html } from 'lit';
import { StatusErrorScreen } from './status-error-screen.js';

customElements.define('status-error-screen', StatusErrorScreen);

export default {
  title: 'Screens / Error Screen',
  component: 'status-error-screen',
  argTypes: {
    errorTitle:   { control: 'text' },
    errorMessage: { control: 'text' },
    retryable:    { control: 'boolean' },
    retryLabel:   { control: 'text' },
    dismissLabel: { control: 'text' },
  },
};

export const GenericRetryable = {
  name: 'Generic - Retryable',
  args: {
    errorTitle: 'Something went wrong',
    errorMessage: "We couldn't process your request. Please try again later.",
    retryable: true,
  },
  render: (args) => html`
    <status-error-screen
      errorTitle="${args.errorTitle}"
      errorMessage="${args.errorMessage}"
      ?retryable="${args.retryable}"
    ></status-error-screen>
  `,
};

export const Timeout = {
  name: 'Timeout',
  args: {
    errorTitle: 'Request timed out',
    errorMessage: 'The request took too long. Please try again.',
    retryable: true,
  },
  render: (args) => html`
    <status-error-screen
      errorTitle="${args.errorTitle}"
      errorMessage="${args.errorMessage}"
      ?retryable="${args.retryable}"
    ></status-error-screen>
  `,
};

export const SessionExpired = {
  name: 'Session Expired (Non-retryable)',
  args: {
    errorTitle: 'Session expired',
    errorMessage: 'Your session has expired. Please log in again.',
    retryable: false,
  },
  render: (args) => html`
    <status-error-screen
      errorTitle="${args.errorTitle}"
      errorMessage="${args.errorMessage}"
      ?retryable="${args.retryable}"
    ></status-error-screen>
  `,
};
