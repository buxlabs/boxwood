const { Body, Head, Html, Script, Title } = require("../../..")

module.exports = () => {
  return Html([
    Head([Title("Plain")]),
    Body([Script({ type: "application/json", id: "plain" }, '{"a":1}')]),
  ])
}
