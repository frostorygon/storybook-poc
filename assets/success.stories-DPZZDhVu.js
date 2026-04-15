import{n as e}from"./chunk-BneVvdWh.js";import{i as t,t as n}from"./lit-BuLH1Ksq.js";import{t as r}from"./holdcard-success-screen-BzOss7eb.js";var i,a=e((()=>{i={transactionType:`held`}})),o,s=e((()=>{o={transactionType:`unheld`}})),c,l,u,d;e((()=>{n(),r(),a(),s(),c={title:`Screens / Success Screen`,component:`holdcard-success-screen`},l={name:`Default - Hold`,parameters:{mockData:[{url:`/api/v1/cards/*/hold`,method:`POST`,status:200,response:i}]},render:()=>t`<holdcard-success-screen .transactionType=${i.transactionType}></holdcard-success-screen>`},u={name:`Default - Unhold`,parameters:{mockData:[{url:`/api/v1/cards/*/unhold`,method:`POST`,status:200,response:o}]},render:()=>t`<holdcard-success-screen .transactionType=${o.transactionType}></holdcard-success-screen>`},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  name: 'Default - Hold',
  parameters: {
    mockData: [{
      url: '/api/v1/cards/*/hold',
      method: 'POST',
      status: 200,
      response: holdSuccess
    }]
  },
  render: () => html\`<holdcard-success-screen .transactionType=\${holdSuccess.transactionType}></holdcard-success-screen>\`
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  name: 'Default - Unhold',
  parameters: {
    mockData: [{
      url: '/api/v1/cards/*/unhold',
      method: 'POST',
      status: 200,
      response: unholdSuccess
    }]
  },
  render: () => html\`<holdcard-success-screen .transactionType=\${unholdSuccess.transactionType}></holdcard-success-screen>\`
}`,...u.parameters?.docs?.source}}},d=[`DefaultHold`,`DefaultUnhold`]}))();export{l as DefaultHold,u as DefaultUnhold,d as __namedExportsOrder,c as default};