const { Div } = require("../../..")

module.exports = () => {
  return [Div({ "data-foo": 1, "data-bar": 0 }, "baz")]
}
