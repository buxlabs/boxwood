const { component, doctype, div, js, html, head, body } = require("../../..")
const { join } = require("path")

const script = js.load(join(__dirname, "client.js"), { target: "head" })

module.exports = component(
  () => {
    return [doctype(), html([head([]), body([div(["hello, world!"])])])]
  },
  {
    scripts: [script],
  }
)
