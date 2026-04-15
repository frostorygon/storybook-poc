import{n as e}from"./chunk-BneVvdWh.js";import{i as t,n,s as r,t as i}from"./lit-BuLH1Ksq.js";import{n as a,t as o}from"./tokens-D6sXNzpm.js";import{t as s}from"./lion-button-kFaVI1dM.js";var c,l=e((()=>{i(),a(),s(),c=class extends n{static get properties(){return{errorContext:{type:Object}}}constructor(){super(),this.errorContext=null}static get styles(){return[o,r`
        :host { display: block; text-align: center; padding: 24px 0; }
        .icon { font-size: 48px; color: var(--color-hold, #c62828); margin-bottom: 16px; }
        h2 { margin: 0 0 8px 0; font-size: 20px; }
        p  { margin: 0 0 24px 0; color: var(--color-text-muted, #666); font-size: 14px; }
      `]}_onRetry(){this.dispatchEvent(new CustomEvent(`retry`,{bubbles:!0,composed:!0}))}render(){return this.errorContext?t`
      <div class="icon" aria-hidden="true">⚠</div>
      <h2>${this.errorContext.errorTitle}</h2>
      <p>${this.errorContext.errorMessage}</p>
      ${this.errorContext.retryable?t`<lion-button @click="${this._onRetry}">Try Again</lion-button>`:t`<lion-button>Back to overview</lion-button>`}
    `:(console.error(`[holdcard-error-screen] rendered without errorContext — this is a bug in feature-flow`),t`
        <div class="icon" aria-hidden="true">⚠</div>
        <h2>An unexpected error occurred</h2>
        <p>Please go back and try again.</p>
      `)}},customElements.define(`holdcard-error-screen`,c)}));export{l as t};