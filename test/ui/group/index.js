const { Group } = require("../../../ui")
const { Doctype, Html, Head, Body, Div } = require("../../..")

module.exports = ({
  align,
  breakpoint,
  justify,
  id,
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
        Group(
          {
            align,
            breakpoint,
            id,
            justify,
            gap,
            width,
            margin,
            padding,
            style,
          },
          [Div("foo"), Div("bar")]
        ),
      ]),
    ]),
  ]
}
