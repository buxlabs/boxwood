const { component, div, js, html, head, body } = require("../..")
const { join } = require("path")

module.exports = component(
  () => {
    return html([head([]), body([div(["hello, world!"])])])
  },
  {
    scripts: [
      js.load(join(__dirname, "client1.js"), {
        transform(code) {
          return code.replace("bar", "baz")
        },
      }),
      js.load(join(__dirname, "client2.js")),
      js.load(join(__dirname, "client3/index.js")),
    ],
  }
)
