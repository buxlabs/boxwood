const { Grid } = require("../../../ui")
const { Doctype, Html, Head, Body, Div } = require("../../..")

module.exports = ({ className, columns, id, style, gap } = {}) => {
  return [
    Doctype(),
    Html([
      Head(),
      Body([
        Grid({ className, columns, id, style, gap }, [Div("foo"), Div("bar")]),
      ]),
    ]),
  ]
}
