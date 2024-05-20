const { component, doctype, div, js, html, head, body } = require("../../..")

const script = js.load(__dirname, "client.js", { target: "head" })

module.exports = component(
  () => {
    return [doctype(), html([head([]), body([div(["hello, world!"])])])]
  },
  {
    scripts: [script],
  }
)
