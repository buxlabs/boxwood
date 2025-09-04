const Group = require("../../../ui/Group")
const { Doctype, Html, Head, Body, Div } = require("../../..")

module.exports = ({ align, justify, gap, style } = {}) => {
  return [
    Doctype(),
    Html([
      Head(),
      Body([Group({ align, justify, gap, style }, [Div("foo"), Div("bar")])]),
    ]),
  ]
}
