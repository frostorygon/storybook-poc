/**
 * @fileoverview Shared design tokens for the Holdcard feature.
 *
 * Import in any Lit component:
 *   import { colorTokens } from '../../tokens.js';
 *   static get styles() { return [colorTokens, css`...`]; }
 */

import { css } from 'lit';

/**
 * Brand and semantic colour tokens.
 * Referenced as CSS custom properties throughout component styles.
 */
export const colorTokens = css`
  :host {
    --color-brand:      #ff6200;    /* Brand primary */
    --color-active:     #2e7d32;    /* success green */
    --color-active-bg:  #e8f5e9;
    --color-hold:       #c62828;    /* danger red */
    --color-hold-bg:    #ffebee;
    --color-text-muted: #666666;
    --color-surface:    #ffffff;
    --color-bg:         #f5f5f5;
  }
`;
