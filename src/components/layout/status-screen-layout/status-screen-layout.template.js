import { html } from 'lit';

/**
 * @param {import('./status-screen-layout.js').StatusScreenLayout} _host
 */
export function template(_host) {
  return html`
    <div class="layout-container">
      <div class="icon-area" aria-hidden="true">
        <slot name="icon"></slot>
      </div>

      <div class="header-area">
        <h2 id="title">
          <slot name="title"></slot>
        </h2>
        <div class="description-area">
          <slot name="description"></slot>
        </div>
      </div>

      <div class="custom-content-area">
        <slot name="custom-content"></slot>
      </div>

      <div class="actions-area">
        <slot name="actions"></slot>
      </div>
    </div>
  `;
}
