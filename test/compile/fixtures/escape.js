const { code } = require("../../..")

module.exports = () => {
  return [code("<h1>foo</h1>"), code(["<h2>bar</h2>", "<h2>baz</h2>"])]
}
