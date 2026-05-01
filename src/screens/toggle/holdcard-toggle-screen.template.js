import { html } from 'lit';

/**
 * Pure template function for the toggle screen.
 * Every dependency is in the function signature — no hidden coupling to `this`.
 *
 * @param {object} props
 * @param {import('../../types.js').CardStatus} props.cardStatus
 * @param {string} [props.accountHolder]
 * @param {string} [props.maskedNumber]
 * @param {boolean} props.isLoading
 * @param {boolean} props.error
 * @param {(e: Event) => void} props.onAction
 */
export function template({ cardStatus, accountHolder, maskedNumber, isLoading, error, onAction }) {
  if (isLoading) {
    return html`<p role="status" aria-live="polite">Loading card details…</p>`;
  }

  if (error) {
    return html`
      <p role="alert" style="color: var(--color-hold, red)">
        Failed to load card details. Please try again later.
      </p>
    `;
  }

  const isActive = cardStatus === 'active';
  const maskedDisplay = maskedNumber ?? '**** **** **** ????';
  const maskedLabel = `Card ending in ${maskedDisplay.slice(-4)}`;

  return html`
    <div class="card-preview">
      <div
        class="card-status ${isActive ? 'status-active' : 'status-hold'}"
        aria-label="Card status: ${isActive ? 'Active' : 'On Hold'}">
        ${isActive ? 'Active' : 'On Hold'}
      </div>
      <h2>${accountHolder ?? 'Customer'}</h2>
      <p class="masked-number" aria-label="${maskedLabel}">${maskedDisplay}</p>
    </div>

    <p>
      ${isActive
        ? 'You can temporarily freeze your card if you misplaced it. You can unfreeze it at any time.'
        : 'Your card is currently on hold and cannot be used for transactions.'}
    </p>

    <lion-button @click="${onAction}">
      ${isActive ? 'Hold Card' : 'Unhold Card'}
    </lion-button>
  `;
}
