const Group = require("../../../ui/Group")
const { Doctype, Html, Head, Body, Div } = require("../../..")

module.exports = ({
  align,
  justify,
  gap,
  width,
  margin,
  padding,
  style,
} = {}) => {
  return [
    Doctype(),
    Html([
      Head(),
      Body([
        Group({ align, justify, gap, width, margin, padding, style }, [
          Div("foo"),
          Div("bar"),
        ]),
      ]),
    ]),
  ]
}
