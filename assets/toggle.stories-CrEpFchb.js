import{n as e}from"./chunk-BneVvdWh.js";import{i as t,t as n}from"./lit-BuLH1Ksq.js";import{a as r,i,n as a,o,r as s,t as c}from"./error-C0q4pALb.js";import{t as l}from"./holdcard-toggle-screen-BjkLyu5M.js";var u,d,f,p,m,h;e((()=>{n(),l(),o(),i(),a(),u={title:`Screens / Toggle Screen`,component:`holdcard-toggle-screen`},d={name:`Default - Active`,args:{...r,cardId:`HAHAHA`,cardType:`credit`,maskedNumber:`**** **** **** 4564`,accountHolder:`HAHAHA`},parameters:{mockData:[{url:`/api/v1/cards/HAHAHA`,method:`GET`,status:200,response:r}]},render:e=>t`<holdcard-toggle-screen .cardStatus=${e.cardStatus} .accountHolder=${e.accountHolder}></holdcard-toggle-screen>`},f={name:`Default - On Hold`,args:{...s},parameters:{mockData:[{url:`/api/v1/cards/*`,method:`GET`,status:200,response:s}]},render:e=>t`<holdcard-toggle-screen .cardStatus=${e.cardStatus} .accountHolder=${e.accountHolder}></holdcard-toggle-screen>`},p={name:`Loading`,args:{isLoading:!0},argTypes:{isLoading:{control:!1}},render:()=>t`<holdcard-toggle-screen isLoading></holdcard-toggle-screen>`},m={name:`Error`,args:{...c},argTypes:{errorCode:{control:!1},errorMessage:{control:!1}},render:()=>t`<holdcard-toggle-screen error></holdcard-toggle-screen>`},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: 'Default - Active',
  args: {
    ...defaultActive,
    cardId: "HAHAHA",
    cardType: "credit",
    maskedNumber: "**** **** **** 4564",
    accountHolder: "HAHAHA"
  },
  parameters: {
    mockData: [{
      url: '/api/v1/cards/HAHAHA',
      method: 'GET',
      status: 200,
      response: defaultActive
    }]
  },
  render: args => html\`<holdcard-toggle-screen .cardStatus=\${args.cardStatus} .accountHolder=\${args.accountHolder}></holdcard-toggle-screen>\`
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  name: 'Default - On Hold',
  args: {
    ...defaultOnHold
  },
  parameters: {
    mockData: [{
      url: '/api/v1/cards/*',
      method: 'GET',
      status: 200,
      response: defaultOnHold
    }]
  },
  render: args => html\`<holdcard-toggle-screen .cardStatus=\${args.cardStatus} .accountHolder=\${args.accountHolder}></holdcard-toggle-screen>\`
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  name: 'Loading',
  args: {
    isLoading: true
  },
  argTypes: {
    isLoading: {
      control: false
    }
  },
  render: () => html\`<holdcard-toggle-screen isLoading></holdcard-toggle-screen>\`
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  name: 'Error',
  args: {
    ...errorResponse
  },
  argTypes: {
    errorCode: {
      control: false
    },
    errorMessage: {
      control: false
    }
  },
  render: () => html\`<holdcard-toggle-screen error></holdcard-toggle-screen>\`
}`,...m.parameters?.docs?.source}}},h=[`DefaultActive`,`DefaultOnHold`,`Loading`,`Error`]}))();export{d as DefaultActive,f as DefaultOnHold,m as Error,p as Loading,h as __namedExportsOrder,u as default};