const { Center } = require("../../../ui")
const { Doctype, Html, Head, Body, Div } = require("../../..")

module.exports = () => {
  return [Doctype(), Html([Head(), Body([Center([Div("foo"), Div("bar")])])])]
}
