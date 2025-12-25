const { Grid } = require("../../../ui")
const { Doctype, Html, Head, Body, Div } = require("../../..")

module.exports = ({ className, columns, id, style, gap, breakpoint } = {}) => {
  return [
    Doctype(),
    Html([
      Head(),
      Body([
        Grid({ className, columns, id, style, gap, breakpoint }, [Div("foo"), Div("bar")]),
      ]),
    ]),
  ]
}
