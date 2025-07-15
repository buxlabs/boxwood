const { component, Doctype, Html, Head, Body, Div, js } = require("../../../../..")

const script = js`
  console.log("Hello from inline script")
`

module.exports = component(
  () => {
    return [
      Doctype(),
      Html([
        Head([]),
        Body([
          Div(["Page with inline script"])
        ])
      ])
    ]
  },
  {
    scripts: [script]
  }
)