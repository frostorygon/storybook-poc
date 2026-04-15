import{n as e}from"./chunk-BneVvdWh.js";import{r as t}from"./react-gIgfvXDd.js";import{a as n}from"./chunk-RD3KTAHR-Dw9vCZVz.js";import{a as r,o as i,s as a}from"./blocks-Bp2QTyrX.js";import{t as o}from"./mdx-react-shim-C5shDHEa.js";import{a as s,i as c,o as l,r as u}from"./error-C0q4pALb.js";import{i as d,n as f,r as p,t as m}from"./session-expired-HJiMj9cE.js";function h(e){let n={code:`code`,em:`em`,h1:`h1`,h2:`h2`,h3:`h3`,hr:`hr`,p:`p`,strong:`strong`,...t(),...e.components};return(0,_.jsxs)(_.Fragment,{children:[(0,_.jsx)(r,{title:`Flows / API Fixtures`}),`
`,(0,_.jsx)(n.h1,{id:`api-fixtures--mocks`,children:`API Fixtures & Mocks`}),`
`,(0,_.jsxs)(n.p,{children:[`This document serves as a centralized reference for Backend Developers and QA to validate the shape of the mock data used throughout the `,(0,_.jsx)(n.strong,{children:`Temporary Holdcard`}),` flows.`]}),`
`,(0,_.jsx)(n.hr,{}),`
`,(0,_.jsx)(n.h2,{id:`1-toggle-screen-data`,children:`1. Toggle Screen Data`}),`
`,(0,_.jsx)(n.p,{children:`The Toggle screen relies on a GET request to fetch the initial status of the card.`}),`
`,(0,_.jsx)(n.h3,{id:`active-card`,children:`Active Card`}),`
`,(0,_.jsxs)(n.p,{children:[(0,_.jsx)(n.strong,{children:`Simulated Endpoint:`}),` `,(0,_.jsx)(n.code,{children:`GET /api/v1/cards/{cardId}`})]}),`
`,(0,_.jsx)(i,{dark:!0,language:`json`,code:JSON.stringify(s,null,2)}),`
`,(0,_.jsx)(n.h3,{id:`on-hold-card`,children:`On-Hold Card`}),`
`,(0,_.jsxs)(n.p,{children:[(0,_.jsx)(n.strong,{children:`Simulated Endpoint:`}),` `,(0,_.jsx)(n.code,{children:`GET /api/v1/cards/{cardId}`})]}),`
`,(0,_.jsx)(i,{dark:!0,language:`json`,code:JSON.stringify(u,null,2)}),`
`,(0,_.jsx)(n.hr,{}),`
`,(0,_.jsx)(n.h2,{id:`2-action-submissions-success-states`,children:`2. Action Submissions (Success States)`}),`
`,(0,_.jsx)(n.p,{children:`Holding or unholding the card submits data via POST. The UI confirms these actions based purely on the successful 200/204 response.`}),`
`,(0,_.jsxs)(n.p,{children:[(0,_.jsx)(n.strong,{children:`Hold Endpoint (Action):`}),` `,(0,_.jsx)(n.code,{children:`POST /api/v1/cards/{cardId}/hold`}),`
`,(0,_.jsx)(n.strong,{children:`Unhold Endpoint (Action):`}),` `,(0,_.jsx)(n.code,{children:`POST /api/v1/cards/{cardId}/unhold`})]}),`
`,(0,_.jsx)(n.p,{children:(0,_.jsx)(n.em,{children:`(No payload required for these actions other than auth headers)`})}),`
`,(0,_.jsx)(n.hr,{}),`
`,(0,_.jsx)(n.h2,{id:`3-error-schemas`,children:`3. Error Schemas`}),`
`,(0,_.jsx)(n.p,{children:`The following objects are ingested by the Error Screen when backend requests fail.`}),`
`,(0,_.jsx)(n.h3,{id:`generic-failed-response`,children:`Generic Failed Response`}),`
`,(0,_.jsx)(i,{dark:!0,language:`json`,code:JSON.stringify(p,null,2)}),`
`,(0,_.jsx)(n.h3,{id:`session-expired-auth-error`,children:`Session Expired (Auth Error)`}),`
`,(0,_.jsx)(i,{dark:!0,language:`json`,code:JSON.stringify(f,null,2)})]})}function g(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,_.jsx)(n,{...e,children:(0,_.jsx)(h,{...e})}):h(e)}var _;e((()=>{_=n(),o(),a(),l(),c(),d(),m()}))();export{g as default};