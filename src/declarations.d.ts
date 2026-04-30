/**
 * Module declarations for packages that ship without TypeScript types.
 *
 * Without these, @ts-check marks every @lion/ui import as an error.
 * We declare them as "any" modules — we get no type safety on Lion internals,
 * but our own component code around them is fully type-checked.
 */

declare module '@lion/ui/define/lion-button.js';
declare module '@lion/ui/define/lion-input.js';
declare module '@lion/ui/define/lion-form.js';
declare module '@lion/ui/define/lion-dialog.js';
declare module '@lion/ui/*';

/**
 * HTMLElementTagNameMap for scoped custom elements.
 *
 * Because we use @open-wc/scoped-elements, our tags are NOT registered
 * on the global customElements registry. The IDE (lit-plugin) can't
 * discover them automatically.
 *
 * This tells the IDE: "when you see <tag-name>, map it to this class."
 * It does NOT register anything at runtime — purely for IntelliSense.
 */
declare global {
  interface HTMLElementTagNameMap {
    'status-screen-layout': import('./components/layout/status-screen-layout/status-screen-layout.js').StatusScreenLayout;
    'status-error-screen': import('./components/screens/status-error-screen/status-error-screen.js').StatusErrorScreen;
    'status-success-screen': import('./components/screens/status-success-screen/status-success-screen.js').StatusSuccessScreen;
    'holdcard-toggle-screen': import('./screens/toggle/holdcard-toggle-screen.js').HoldcardToggleScreen;
    'session-expired-error-screen': import('./screens/error/session-expired/session-expired-error-screen.js').SessionExpiredErrorScreen;
  }
}
