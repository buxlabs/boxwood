const { Stack } = require("../../../ui")
const { Doctype, Html, Head, Body, Div } = require("../../..")

module.exports = ({
  align,
  id,
  justify,
  gap,
  width,
  padding,
  margin,
  style,
} = {}) => {
  return [
    Doctype(),
    Html([
      Head(),
      Body([
        Stack({ align, id, justify, gap, width, padding, margin, style }, [
          Div("foo"),
          Div("bar"),
        ]),
      ]),
    ]),
  ]
}
