import{n as e}from"./chunk-BneVvdWh.js";import{r as t}from"./react-gIgfvXDd.js";import{a as n}from"./chunk-RD3KTAHR-Dw9vCZVz.js";import{a as r,s as i}from"./blocks-Bp2QTyrX.js";import{t as a}from"./mdx-react-shim-C5shDHEa.js";function o(e){let n={code:`code`,h1:`h1`,h2:`h2`,p:`p`,strong:`strong`,...t(),...e.components};return(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(r,{title:`Docs & Overview / Introduction`}),`
`,(0,c.jsx)(n.h1,{id:`temporary-holdcard`,children:`Temporary Holdcard`}),`
`,(0,c.jsx)(n.p,{children:`Allows the customer to temporarily hold or unhold their debit/credit card
from the native banking app. The feature opens as a webview.`}),`
`,(0,c.jsx)(n.h2,{id:`flow-diagram`,children:`Flow Diagram`}),`
`,(0,c.jsx)(n.p,{children:`┌─────────────┐
│   Toggle    │
│   Screen    │
└──────┬──────┘
│
┌──────┴──────┐
│             │
┌────▼────┐   ┌────▼─────┐
│ Success │   │  Error   │
│ Screen  │   │  Screen  │
└─────────┘   └──────────┘`}),`
`,(0,c.jsx)(n.h2,{id:`how-to-navigate`,children:`How to Navigate`}),`
`,(0,c.jsxs)(n.p,{children:[`| If you are a...      | Start here                                           |
|----------------------|------------------------------------------------------|
| `,(0,c.jsx)(n.strong,{children:`Product Owner`}),`    | → `,(0,c.jsx)(n.strong,{children:`Flows`}),` — walk through each scenario end to end  |
| `,(0,c.jsx)(n.strong,{children:`Backend Engineer`}),` | → `,(0,c.jsx)(n.strong,{children:`Screens`}),` → open any screen → check `,(0,c.jsx)(n.code,{children:`fixtures/`}),`  |
| `,(0,c.jsx)(n.strong,{children:`Frontend Engineer`}),`| → `,(0,c.jsx)(n.strong,{children:`Screens`}),` → open the `,(0,c.jsx)(n.code,{children:`Default`}),` story → use controls |
| `,(0,c.jsx)(n.strong,{children:`QA / Tester`}),`      | → All stories are snapshot targets for visual regression |`]}),`
`,(0,c.jsx)(n.h2,{id:`native-layer-args`,children:`Native Layer Args`}),`
`,(0,c.jsx)(n.p,{children:`This feature receives the following arguments from the native app layer:`}),`
`,(0,c.jsxs)(n.p,{children:[`| Arg              | Type     | Description                      |
|------------------|----------|----------------------------------|
| `,(0,c.jsx)(n.code,{children:`cardId`}),`         | `,(0,c.jsx)(n.code,{children:`string`}),` | The card identifier              |
| `,(0,c.jsx)(n.code,{children:`cardStatus`}),`     | `,(0,c.jsx)(n.code,{children:`string`}),` | Current status: `,(0,c.jsx)(n.code,{children:`active`}),` or `,(0,c.jsx)(n.code,{children:`on-hold`}),` |
| `,(0,c.jsx)(n.code,{children:`accountHolder`}),`  | `,(0,c.jsx)(n.code,{children:`string`}),` | Customer display name            |`]})]})}function s(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,c.jsx)(n,{...e,children:(0,c.jsx)(o,{...e})}):o(e)}var c;e((()=>{c=n(),a(),i()}))();export{s as default};