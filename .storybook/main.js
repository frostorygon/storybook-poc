/** @type { import('@web/storybook-framework-web-components').StorybookConfig } */
const config = {
  stories: [
    '../stories/**/*.mdx',
    '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-links',
    '@web/storybook-addon-mocks',
  ],
  framework: {
    name: '@web/storybook-framework-web-components',
    options: {},
  },
};
export default config;