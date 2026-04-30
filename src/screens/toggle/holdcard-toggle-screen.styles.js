import { css } from 'lit';
import { colorTokens } from '../../tokens.js';

export const styles = [
  colorTokens,
  css`
    :host { display: block; text-align: center; }

    .card-preview {
      background: var(--color-surface, #fff);
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      margin-bottom: 24px;
    }

    .card-status {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-weight: bold;
      font-size: 12px;
      text-transform: uppercase;
      margin-bottom: 12px;
    }

    .status-active { background: var(--color-active-bg, #e8f5e9); color: var(--color-active, #2e7d32); }
    .status-hold   { background: var(--color-hold-bg, #ffebee);   color: var(--color-hold, #c62828);   }
    .masked-number { color: var(--color-text-muted, #666); font-size: 14px; letter-spacing: 2px; }

    h2 { margin: 0 0 8px 0; font-size: 18px; }
    p  { margin: 0 0 24px 0; color: var(--color-text-muted, #666); font-size: 14px; }
  `,
];
