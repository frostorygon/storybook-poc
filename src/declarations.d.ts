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
