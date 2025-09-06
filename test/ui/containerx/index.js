const COntainer = require("../../../ui/containerx")
const { Doctype, Html, Head, Body, Div } = require("../../..")

module.exports = ({ className, width, padding, style } = {}) => {
  return [
    Doctype(),
    Html([
      Head(),
      Body([
        COntainer({ className, width, padding, style }, [
          Div("foo"),
          Div("bar"),
        ]),
      ]),
    ]),
  ]
}
