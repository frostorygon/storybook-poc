// @ts-check
import { LitElement } from 'lit';
import { template } from './status-screen-layout.template.js';
import { styles } from './status-screen-layout.styles.js';

/**
 * status-screen-layout — Structural shell for all feedback/status screens.
 * Handles positioning of icons, titles, descriptions, and custom content.
 * Uses composition via slots — zero business logic.
 *
 * @slot icon - Area for status-specific icons.
 * @slot title - The primary heading.
 * @slot description - Supporting text.
 * @slot custom-content - Escape hatch for unique UI (cards, accordions, images).
 * @slot actions - Footer area for buttons or pills.
 */
export class StatusScreenLayout extends LitElement {
  static get styles() {
    return [styles];
  }

  render() {
    return template();
  }
}
