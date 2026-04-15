import{n as e}from"./chunk-BneVvdWh.js";import{i as t,n,s as r,t as i}from"./lit-BuLH1Ksq.js";import{n as a,t as o}from"./tokens-D6sXNzpm.js";import{t as s}from"./lion-button-kFaVI1dM.js";var c,l=e((()=>{i(),a(),s(),c=class extends n{static get properties(){return{cardStatus:{type:String},accountHolder:{type:String},maskedNumber:{type:String},isLoading:{type:Boolean},error:{type:Boolean}}}constructor(){super(),this.cardStatus=`active`,this.accountHolder=void 0,this.maskedNumber=void 0,this.isLoading=!1,this.error=!1}static get styles(){return[o,r`
        :host { display: block; text-align: center; }
        .card-preview {
          background: var(--color-surface, #fff);
          border-radius: 8px;
          padding: 24px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          margin-bottom: 24px;
        }
        .card-status {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: bold;
          font-size: 12px;
          text-transform: uppercase;
          margin-bottom: 12px;
        }
        .status-active { background: var(--color-active-bg, #e8f5e9); color: var(--color-active, #2e7d32); }
        .status-hold   { background: var(--color-hold-bg, #ffebee);   color: var(--color-hold, #c62828);   }
        .masked-number { color: var(--color-text-muted, #666); font-size: 14px; letter-spacing: 2px; }
        h2 { margin: 0 0 8px 0; font-size: 18px; }
        p  { margin: 0 0 24px 0; color: var(--color-text-muted, #666); font-size: 14px; }
      `]}_onAction(){this.dispatchEvent(new CustomEvent(`action`,{detail:{action:this.cardStatus===`active`?`hold`:`unhold`},bubbles:!0,composed:!0}))}render(){if(this.isLoading)return t`<p role="status" aria-live="polite">Loading card details…</p>`;if(this.error)return t`
        <p role="alert" style="color: var(--color-hold, red)">
          Failed to load card details. Please try again later.
        </p>
      `;let e=this.cardStatus===`active`,n=this.maskedNumber??`**** **** **** ????`,r=`Card ending in ${n.slice(-4)}`;return t`
      <div class="card-preview">
        <div
          class="card-status ${e?`status-active`:`status-hold`}"
          aria-label="Card status: ${e?`Active`:`On Hold`}">
          ${e?`Active`:`On Hold`}
        </div>
        <h2>${this.accountHolder??`Customer`}</h2>
        <p class="masked-number" aria-label="${r}">${n}</p>
      </div>

      <p>
        ${e?`You can temporarily freeze your card if you misplaced it. You can unfreeze it at any time.`:`Your card is currently on hold and cannot be used for transactions.`}
      </p>

      <lion-button @click="${this._onAction}">
        ${e?`Hold Card`:`Unhold Card`}
      </lion-button>
    `}},customElements.define(`holdcard-toggle-screen`,c)}));export{l as t};