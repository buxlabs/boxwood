const Stack = require("../../../ui/Stack")
const { Doctype, Html, Head, Body, Div } = require("../../..")

module.exports = ({ align, justify, gap, style } = {}) => {
  return [
    Doctype(),
    Html([
      Head(),
      Body([Stack({ align, justify, gap, style }, [Div("foo"), Div("bar")])]),
    ]),
  ]
}
