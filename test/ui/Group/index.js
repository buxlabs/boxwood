const Group = require("../../../ui/Group")
const { Doctype, Html, Head, Body, Div } = require("../../..")

module.exports = () => {
  return [Doctype(), Html([Head(), Body([Group([Div("foo"), Div("bar")])])])]
}
