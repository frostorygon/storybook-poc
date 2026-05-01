import { html } from 'lit';

/**
 * Pure template function for the success screen.
 *
 * @param {object} props
 * @param {string} props.successTitle
 * @param {string} props.successMessage
 * @param {string} props.dismissLabel
 * @param {(e: Event) => void} props.onDismiss
 */
export function template({ successTitle, successMessage, dismissLabel, onDismiss }) {
  return html`
    <status-screen-layout role="alert">
      <div slot="icon" style="color: var(--color-active, #2e7d32)">✓</div>
      <slot name="title" slot="title"><span>${successTitle}</span></slot>
      <slot name="description" slot="description"><span>${successMessage}</span></slot>
      <slot name="custom-content" slot="custom-content"></slot>
      <slot name="actions" slot="actions">
        <lion-button @click="${onDismiss}">${dismissLabel}</lion-button>
      </slot>
    </status-screen-layout>
  `;
}
