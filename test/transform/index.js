const { component, Div, js, Html, Head, Body } = require("../..")
const { join } = require("path")

module.exports = component(
  () => {
    return Html([Head([]), Body([Div(["hello, world!"])])])
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
