import{n as e}from"./chunk-BneVvdWh.js";import{r as t}from"./react-gIgfvXDd.js";import{a as n}from"./chunk-RD3KTAHR-Dw9vCZVz.js";import{a as r,s as i}from"./blocks-Bp2QTyrX.js";import{t as a}from"./mdx-react-shim-C5shDHEa.js";function o(e){let n={code:`code`,h1:`h1`,h2:`h2`,p:`p`,...t(),...e.components};return(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(r,{title:`Screens / Error Screen`,name:`Docs`}),`
`,(0,c.jsx)(n.h1,{id:`error-screen`,children:`Error Screen`}),`
`,(0,c.jsx)(n.p,{children:`Catch-all error screen for all failure scenarios in this feature.`}),`
`,(0,c.jsx)(n.h2,{id:`states`,children:`States`}),`
`,(0,c.jsxs)(n.p,{children:[`| State              | Story Name                 | Description                              |
|--------------------|----------------------------|------------------------------------------|
| Generic failure    | `,(0,c.jsx)(n.code,{children:`Default - Generic`}),`        | Unspecified backend error                |
| Request timeout    | `,(0,c.jsx)(n.code,{children:`Default - Timeout`}),`        | Request took too long                    |
| Session expired    | `,(0,c.jsx)(n.code,{children:`Default - Session Expired`}),`| Auth token expired, user must re-login   |`]}),`
`,(0,c.jsx)(n.h2,{id:`design-decision`,children:`Design Decision`}),`
`,(0,c.jsx)(n.p,{children:`All error scenarios use the same screen with different copy and CTA behavior,
rather than separate error screens. This keeps the error surface minimal and
makes it easier to maintain consistency.`}),`
`,(0,c.jsx)(n.h2,{id:`fixtures`,children:`Fixtures`}),`
`,(0,c.jsxs)(n.p,{children:[`Each fixture maps to a different error type. The `,(0,c.jsx)(n.code,{children:`errorCode`}),` field drives
which copy and CTA the screen renders.`]})]})}function s(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,c.jsx)(n,{...e,children:(0,c.jsx)(o,{...e})}):o(e)}var c;e((()=>{c=n(),a(),i()}))();export{s as default};