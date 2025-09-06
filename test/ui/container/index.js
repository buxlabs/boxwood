const { Container } = require("../../../ui")
const { Doctype, Html, Head, Body, Div } = require("../../..")

module.exports = ({ className, width, padding, style } = {}) => {
  return [
    Doctype(),
    Html([
      Head(),
      Body([
        Container({ className, width, padding, style }, [
          Div("foo"),
          Div("bar"),
        ]),
      ]),
    ]),
  ]
}
