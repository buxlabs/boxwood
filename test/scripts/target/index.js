const { component, Doctype, Div, js, Html, Head, Body } = require("../../..")
const { join } = require("path")

const script = js.load(join(__dirname, "client.js"), { target: "head" })

module.exports = component(
  () => {
    return [Doctype(), Html([Head([]), Body([Div(["hello, world!"])])])]
  },
  {
    scripts: [script],
  }
)
