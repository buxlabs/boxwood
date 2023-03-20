const { div, br } = require("../../../..")

module.exports = () => [
  div("foo"),
  br(),
  div({ id: "bar" }),
  br({ id: "baz" }),
  div(),
]
