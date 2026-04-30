import { html } from 'lit';

/**
 * @param {import('./holdcard-toggle-screen.js').HoldcardToggleScreen} host
 */
export function template(host) {
  if (host.isLoading) {
    return html`<p role="status" aria-live="polite">Loading card details…</p>`;
  }

  if (host.error) {
    return html`
      <p role="alert" style="color: var(--color-hold, red)">
        Failed to load card details. Please try again later.
      </p>
    `;
  }

  const isActive = host.cardStatus === 'active';
  const maskedDisplay = host.maskedNumber ?? '**** **** **** ????';
  const maskedLabel = `Card ending in ${maskedDisplay.slice(-4)}`;

  return html`
    <div class="card-preview">
      <div
        class="card-status ${isActive ? 'status-active' : 'status-hold'}"
        aria-label="Card status: ${isActive ? 'Active' : 'On Hold'}">
        ${isActive ? 'Active' : 'On Hold'}
      </div>
      <h2>${host.accountHolder ?? 'Customer'}</h2>
      <p class="masked-number" aria-label="${maskedLabel}">${maskedDisplay}</p>
    </div>

    <p>
      ${isActive
        ? 'You can temporarily freeze your card if you misplaced it. You can unfreeze it at any time.'
        : 'Your card is currently on hold and cannot be used for transactions.'}
    </p>

    <lion-button @click="${host._onAction}">
      ${isActive ? 'Hold Card' : 'Unhold Card'}
    </lion-button>
  `;
}
