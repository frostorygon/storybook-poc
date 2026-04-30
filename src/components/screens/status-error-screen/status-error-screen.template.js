import { html } from 'lit';

/**
 * @param {import('./status-error-screen.js').StatusErrorScreen} host
 */
export function template(host) {
  return html`
    <status-screen-layout>
      <div slot="icon" style="color: var(--color-hold, #c62828)">⚠</div>
      <slot name="title" slot="title"><span>${host.errorTitle}</span></slot>
      <slot name="description" slot="description"><span>${host.errorMessage}</span></slot>
      <slot name="custom-content" slot="custom-content"></slot>
      <slot name="actions" slot="actions">
        <div>
          ${host.retryable
            ? html`<lion-button @click="${host._onRetry}">${host.retryLabel}</lion-button>`
            : html`<lion-button @click="${host._onDismiss}">${host.dismissLabel}</lion-button>`}
        </div>
      </slot>
    </status-screen-layout>
  `;
}
