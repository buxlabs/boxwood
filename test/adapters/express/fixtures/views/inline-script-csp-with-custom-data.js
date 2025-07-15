const { component, Doctype, Html, Head, Body, Div, H1, js } = require("../../../../../")

const script = js`
  console.log("Page loaded")
`

module.exports = component(
  ({ title = "Default Title" }) => {
    return [
      Doctype(),
      Html([
        Head([]),
        Body([
          H1([title]),
          Div(["Page with custom data and script"])
        ])
      ])
    ]
  },
  {
    scripts: [script]
  }
)