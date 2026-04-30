/**
 * Vitest browser setup — loads the scoped custom element registry polyfill
 * before any component code runs. Without this, ScopedElementsMixin throws
 * "importNode is not a function" because the polyfill patches Document.prototype.
 */
import '@webcomponents/scoped-custom-element-registry';
