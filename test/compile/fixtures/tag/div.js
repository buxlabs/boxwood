const { Div, Br } = require("../../../..")

module.exports = () => [
  Div("foo"),
  Br(),
  Div({ id: "bar" }),
  Br({ id: "baz" }),
  Div(),
]
