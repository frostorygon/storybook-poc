import { css } from 'lit';
import { colorTokens } from './tokens.js';

export const styles = [
  colorTokens,
  css`
    :host {
      display: block;
      font-family: Arial, sans-serif;
      max-width: 480px;
      margin: 0 auto;
      border: 1px solid #ccc;
      border-radius: 8px;
      overflow: hidden;
    }
    .header {
      background-color: var(--color-brand, #ff6200);
      color: white;
      padding: 16px;
      font-weight: bold;
      text-align: center;
    }
    .content {
      padding: 24px;
      background-color: var(--color-bg, #f5f5f5);
      min-height: 300px;
    }
  `,
];
