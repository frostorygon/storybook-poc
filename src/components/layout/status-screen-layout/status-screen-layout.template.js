import { html } from 'lit';

/**
 * Pure template function for the status screen layout.
 * This layout component is slots-only — no props needed.
 */
export function template() {
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
