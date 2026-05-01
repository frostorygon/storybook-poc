import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming/create';

const acmeTheme = create({
  base: 'dark',

  // Typography
  fontBase: '"Inter", sans-serif',
  fontCode: 'monospace',

  // Brand
  brandTitle: 'Acme Components',
  brandUrl: 'https://example.com',
  brandImage: 'https://placehold.co/200x50/111217/FF6200?text=Acme+Labs',
  brandTarget: '_self',

  // Core UI Customization (matching Grafana dark theme look)
  colorPrimary: '#FF6200',
  colorSecondary: '#FF6200',

  // UI
  appBg: '#111217',           // Sidebar Background
  appContentBg: '#181b1f',    // Canvas Background
  appPreviewBg: '#ffffff',    // Inside iframe background (keep components legible)
  appBorderColor: '#303236',
  appBorderRadius: 4,

  // Text colors
  textColor: '#c7d0d9',
  textInverseColor: '#ffffff',

  // Toolbar default and active colors
  barTextColor: '#9ea3a8',
  barSelectedColor: '#FF6200',
  barHoverColor: '#ffffff',
  barBg: '#111217',

  // Form colors
  inputBg: '#181b1f',
  inputBorder: '#303236',
  inputTextColor: '#c7d0d9',
  inputBorderRadius: 4,
});

addons.setConfig({
  theme: acmeTheme,
});
