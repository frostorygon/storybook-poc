import{n as e}from"./chunk-BneVvdWh.js";import{i as t,n,s as r,t as i}from"./lit-BuLH1Ksq.js";import{n as a,t as o}from"./tokens-D6sXNzpm.js";var s,c=e((()=>{i(),a(),s=class extends n{static get properties(){return{transactionType:{type:String}}}constructor(){super(),this.transactionType=null}static get styles(){return[o,r`
        :host { display: block; text-align: center; padding: 24px 0; }
        .icon { font-size: 48px; color: var(--color-active, #2e7d32); margin-bottom: 16px; }
        h2 { margin: 0 0 8px 0; font-size: 20px; }
        p  { margin: 0; color: var(--color-text-muted, #666); font-size: 14px; }
      `]}render(){let e=this.transactionType===`held`;return t`
      <div class="icon" aria-hidden="true">✓</div>
      <h2>Card successfully ${e?`put on hold`:`reactivated`}</h2>
      <p>
        ${e?`Your card is now frozen and cannot be used for new transactions.`:`Your card is active and ready to be used again.`}
      </p>
    `}},customElements.define(`holdcard-success-screen`,s)}));export{c as t};