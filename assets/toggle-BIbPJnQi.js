import{n as e}from"./chunk-BneVvdWh.js";import{r as t}from"./react-gIgfvXDd.js";import{a as n}from"./chunk-RD3KTAHR-Dw9vCZVz.js";import{a as r,s as i}from"./blocks-Bp2QTyrX.js";import{t as a}from"./mdx-react-shim-C5shDHEa.js";function o(e){let n={code:`code`,h1:`h1`,h2:`h2`,p:`p`,...t(),...e.components};return(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(r,{title:`Screens / Toggle Screen`,name:`Docs`}),`
`,(0,c.jsx)(n.h1,{id:`toggle-screen`,children:`Toggle Screen`}),`
`,(0,c.jsx)(n.p,{children:`The entry screen. Displays the current card status and a toggle action.`}),`
`,(0,c.jsx)(n.h2,{id:`states`,children:`States`}),`
`,(0,c.jsxs)(n.p,{children:[`| State              | Story Name           | Description                         |
|--------------------|----------------------|-------------------------------------|
| Card is active     | `,(0,c.jsx)(n.code,{children:`Default - Active`}),`   | Shows "Hold Card" action            |
| Card is on hold    | `,(0,c.jsx)(n.code,{children:`Default - On Hold`}),`  | Shows "Unhold Card" action          |
| Fetching status    | `,(0,c.jsx)(n.code,{children:`Loading`}),`            | Spinner while loading card details  |
| Fetch failed       | `,(0,c.jsx)(n.code,{children:`Error`}),`              | Failed to load card details         |`]}),`
`,(0,c.jsx)(n.h2,{id:`api-dependencies`,children:`API Dependencies`}),`
`,(0,c.jsxs)(n.p,{children:[`| Endpoint                            | Method | Used for                |
|--------------------------------------|--------|-------------------------|
| `,(0,c.jsx)(n.code,{children:`/api/v1/cards/{cardId}`}),`             | GET    | Fetch current card status |
| `,(0,c.jsx)(n.code,{children:`/api/v1/cards/{cardId}/hold`}),`        | POST   | Hold the card            |
| `,(0,c.jsx)(n.code,{children:`/api/v1/cards/{cardId}/unhold`}),`      | POST   | Unhold the card          |`]}),`
`,(0,c.jsx)(n.h2,{id:`fixtures`,children:`Fixtures`}),`
`,(0,c.jsxs)(n.p,{children:[`See `,(0,c.jsx)(n.code,{children:`fixtures/`}),` directory for mock API responses used by each story.`]})]})}function s(e={}){let{wrapper:n}={...t(),...e.components};return n?(0,c.jsx)(n,{...e,children:(0,c.jsx)(o,{...e})}):o(e)}var c;e((()=>{c=n(),a(),i()}))();export{s as default};