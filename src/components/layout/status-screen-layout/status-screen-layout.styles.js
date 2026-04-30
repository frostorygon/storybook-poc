import { css } from 'lit';

export const styles = css`
  :host {
    display: block;
    text-align: center;
    padding: 24px 0;
  }

  .layout-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .icon-area {
    font-size: 48px;
    margin-bottom: 8px;
  }

  .header-area h2 {
    margin: 0 0 8px 0;
    font-size: 20px;
  }

  .description-area {
    color: var(--color-text-muted, #666);
    font-size: 14px;
    margin: 0 0 16px 0;
  }

  .actions-area {
    margin-top: 8px;
  }
`;
