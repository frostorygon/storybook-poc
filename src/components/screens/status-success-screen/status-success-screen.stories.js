import { html } from 'lit';
import { StatusSuccessScreen } from './status-success-screen.js';

customElements.define('status-success-screen', StatusSuccessScreen);

export default {
  title: 'Screens / Success Screen',
  component: 'status-success-screen',
  argTypes: {
    successTitle:   { control: 'text' },
    successMessage: { control: 'text' },
    dismissLabel:   { control: 'text' },
  },
};

export const CardHeld = {
  name: 'Card Put On Hold',
  args: {
    successTitle: 'Card successfully put on hold',
    successMessage: 'Your card is now frozen and cannot be used for new transactions.',
    dismissLabel: 'Back to overview',
  },
  render: (args) => html`
    <status-success-screen
      successTitle="${args.successTitle}"
      successMessage="${args.successMessage}"
      dismissLabel="${args.dismissLabel}"
    ></status-success-screen>
  `,
};

export const CardReactivated = {
  name: 'Card Reactivated',
  args: {
    successTitle: 'Card successfully reactivated',
    successMessage: 'Your card is active and ready to be used again.',
    dismissLabel: 'Back to overview',
  },
  render: (args) => html`
    <status-success-screen
      successTitle="${args.successTitle}"
      successMessage="${args.successMessage}"
      dismissLabel="${args.dismissLabel}"
    ></status-success-screen>
  `,
};

