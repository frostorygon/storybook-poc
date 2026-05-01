import '@webcomponents/scoped-custom-element-registry';

/** @type { import('@web/storybook-framework-web-components').Preview } */
const preview = {
  parameters: {
    options: {
      storySort: {
        includeNames: true,
        order: [
          'Docs & Overview', ['Introduction'],
          'Flows', ['Overview', 'API Fixtures', 'Scenarios', ['*']],
          'Screens', ['*', ['Docs', '*']],
        ],
      },
    },
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#181b1f' },
        { name: 'light', value: '#ffffff' },
      ],
    },
  },
};

export default preview;