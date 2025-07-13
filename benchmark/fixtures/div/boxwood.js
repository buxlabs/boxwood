const { Div } = require("../../..")

// This will be optimized since it has no parameters and returns static content
module.exports = function () {
  return Div("foo")
}
