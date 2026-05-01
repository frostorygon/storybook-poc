import { html } from 'lit';

/**
 * Pure template function for the error screen.
 *
 * @param {object} props
 * @param {string} props.errorTitle
 * @param {string} props.errorMessage
 * @param {boolean} props.retryable
 * @param {string} props.retryLabel
 * @param {string} props.dismissLabel
 * @param {(e: Event) => void} props.onRetry
 * @param {(e: Event) => void} props.onDismiss
 */
export function template({ errorTitle, errorMessage, retryable, retryLabel, dismissLabel, onRetry, onDismiss }) {
  return html`
    <status-screen-layout role="alert">
      <div slot="icon" style="color: var(--color-hold, #c62828)">⚠</div>
      <slot name="title" slot="title"><span>${errorTitle}</span></slot>
      <slot name="description" slot="description"><span>${errorMessage}</span></slot>
      <slot name="custom-content" slot="custom-content"></slot>
      <slot name="actions" slot="actions">
        <div>
          ${retryable
            ? html`<lion-button @click="${onRetry}">${retryLabel}</lion-button>`
            : html`<lion-button @click="${onDismiss}">${dismissLabel}</lion-button>`}
        </div>
      </slot>
    </status-screen-layout>
  `;
}
