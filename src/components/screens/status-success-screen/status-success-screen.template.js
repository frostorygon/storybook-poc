import { html } from 'lit';

/**
 * @param {import('./status-success-screen.js').StatusSuccessScreen} host
 */
export function template(host) {
  return html`
    <status-screen-layout>
      <div slot="icon" style="color: var(--color-active, #2e7d32)">✓</div>
      <slot name="title" slot="title"><span>${host.successTitle}</span></slot>
      <slot name="description" slot="description"><span>${host.successMessage}</span></slot>
      <slot name="custom-content" slot="custom-content"></slot>
      <slot name="actions" slot="actions">
        <lion-button @click="${host._onDismiss}">${host.dismissLabel}</lion-button>
      </slot>
    </status-screen-layout>
  `;
}
