const { component, Doctype, Div, js, Html, Head, Body } = require("../..")
const { join } = require("path")

const headScript = js.load(join(__dirname, "head.js"), { target: "head" })
const bodyScript = js.load(join(__dirname, "body.js"))

module.exports = component(
  () => {
    return [Doctype(), Html([Head([]), Body([Div(["hello, world!"])])])]
  },
  {
    scripts: [headScript, bodyScript],
  }
)