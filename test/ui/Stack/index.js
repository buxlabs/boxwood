const Stack = require("../../../ui/Stack")
const { Doctype, Html, Head, Body, Div } = require("../../..")

module.exports = ({
  align,
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
        Stack({ align, justify, gap, width, padding, margin, style }, [
          Div("foo"),
          Div("bar"),
        ]),
      ]),
    ]),
  ]
}
