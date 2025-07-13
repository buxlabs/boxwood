const { Code } = require("../../..")

module.exports = () => {
  return [Code("<h1>foo</h1>"), Code(["<h2>bar</h2>", "<h2>baz</h2>"])]
}
