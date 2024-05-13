const { component, div, js, html, head, body } = require("../..")

const script = js.load(__dirname, "client.js", {
  transform(code) {
    return code.replace("bar", "baz")
  },
})

module.exports = component(
  () => {
    return html([head([]), body([div(["hello, world!"])])])
  },
  {
    scripts: script,
  }
)
