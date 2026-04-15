import{n as e}from"./chunk-BneVvdWh.js";import{r as t}from"./react-gIgfvXDd.js";import{a as n}from"./chunk-RD3KTAHR-Dw9vCZVz.js";import{a as r,s as i}from"./blocks-Bp2QTyrX.js";import{t as a}from"./mdx-react-shim-C5shDHEa.js";function o(e){let n={code:`code`,h1:`h1`,h2:`h2`,li:`li`,p:`p`,strong:`strong`,ul:`ul`,...t(),...e.components};return(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(r,{title:`Flows / Overview`}),`
`,(0,c.jsx)(n.h1,{id:`flow-scenarios`,children:`Flow Scenarios`}),`
`,(0,c.jsx)(n.h2,{id:`coverage`,children:`Coverage`}),`
`,(0,c.jsx)(n.p,{children:`| Scenario                        | Status | Description                                           |
|---------------------------------|--------|-------------------------------------------------------|
| Hold Card                       | ✅     | User holds an active card → sees success              |
| Unhold Card                     | ✅     | User unholds a held card → sees success               |
| API Unavailable → Error         | ✅     | Backend is down → generic error screen                |
| Session Expired → Error         | ✅     | Token expires mid-flow → session error screen         |
| Network Timeout → Error         | 🔲     | Slow network → timeout error (planned)                |`}),`
`,(0,c.jsx)(n.h2,{id:`preconditions`,children:`Preconditions`}),`
`,(0,c.jsxs)(n.ul,{children:[`
`,(0,c.jsxs)(n.li,{children:[(0,c.jsx)(n.strong,{children:`Hold Card`}),`: `,(0,c.jsx)(n.code,{children:`cardStatus`}),` = `,(0,c.jsx)(n.code,{children:`active`})]}),`
`,(0,c.jsxs)(n.li,{children:[(0,c.jsx)(n.strong,{children:`Unhold Card`}),`: `,(0,c.jsx)(n.code,{children:`cardStatus`}),` = `,(0,c.jsx)(n.code,{children:`on-hold`})]}),`
`,(0,c.jsxs)(n.li,{children:[(0,c.jsx)(n.strong,{children:`Error scenarios`}),`: Any `,(0,c.jsx)(n.code,{children:`cardStatus`}),` — errors can happen regardless`]}),`
`]})]})}function s(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,c.jsx)(n,{...e,children:(0,c.jsx)(o,{...e})}):o(e)}var c;e((()=>{c=n(),a(),i()}))();export{s as default};