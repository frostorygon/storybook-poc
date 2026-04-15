import{n as e}from"./chunk-BneVvdWh.js";import{i as t,t as n}from"./lit-BuLH1Ksq.js";import{i as r,n as i,r as a,t as o}from"./session-expired-HJiMj9cE.js";import{t as s}from"./holdcard-error-screen-4jnxpIt-.js";var c,l=e((()=>{c={errorCode:`TIMEOUT`,errorTitle:`Request timed out`,errorMessage:`The request took too long. Please check your connection and try again.`,retryable:!0}})),u,d,f,p,m;e((()=>{n(),s(),r(),l(),o(),u={title:`Screens / Error Screen`,component:`holdcard-error-screen`},d={name:`Default - Generic`,parameters:{mockData:[{url:`/api/v1/cards/*/hold`,method:`POST`,status:500,response:a}]},render:()=>t`<holdcard-error-screen .errorContext=${a}></holdcard-error-screen>`},f={name:`Default - Timeout`,parameters:{mockData:[{url:`/api/v1/cards/*/hold`,method:`POST`,status:408,response:c}]},render:()=>t`<holdcard-error-screen .errorContext=${c}></holdcard-error-screen>`},p={name:`Default - Session Expired`,parameters:{mockData:[{url:`/api/v1/cards/*/hold`,method:`POST`,status:401,response:i}]},render:()=>t`<holdcard-error-screen .errorContext=${i}></holdcard-error-screen>`},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: 'Default - Generic',
  parameters: {
    mockData: [{
      url: '/api/v1/cards/*/hold',
      method: 'POST',
      status: 500,
      response: genericError
    }]
  },
  render: () => html\`<holdcard-error-screen .errorContext=\${genericError}></holdcard-error-screen>\`
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  name: 'Default - Timeout',
  parameters: {
    mockData: [{
      url: '/api/v1/cards/*/hold',
      method: 'POST',
      status: 408,
      response: timeoutError
    }]
  },
  render: () => html\`<holdcard-error-screen .errorContext=\${timeoutError}></holdcard-error-screen>\`
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  name: 'Default - Session Expired',
  parameters: {
    mockData: [{
      url: '/api/v1/cards/*/hold',
      method: 'POST',
      status: 401,
      response: sessionExpiredError
    }]
  },
  render: () => html\`<holdcard-error-screen .errorContext=\${sessionExpiredError}></holdcard-error-screen>\`
}`,...p.parameters?.docs?.source}}},m=[`DefaultGeneric`,`DefaultTimeout`,`DefaultSessionExpired`]}))();export{d as DefaultGeneric,p as DefaultSessionExpired,f as DefaultTimeout,m as __namedExportsOrder,u as default};