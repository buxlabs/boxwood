const { component, div, js, html, head, body } = require("../..")

module.exports = component(
  () => {
    return html([head([]), body([div(["hello, world!"])])])
  },
  {
    scripts: [
      js.load(__dirname, "client1.js", {
        transform(code) {
          return code.replace("bar", "baz")
        },
      }),
      js.load(__dirname, "client2.js"),
    ],
  }
)
