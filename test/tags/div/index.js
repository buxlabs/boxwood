const { div } = require("../../..")

module.exports = () => {
  return [div({ "data-foo": 1, "data-bar": 0 }, "baz")]
}
