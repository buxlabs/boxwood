const { A } = require("../../..")

module.exports = () => {
  return [A({ href: "/foo" }, "bar"), A({ href: "/baz" }), A("qux")]
}
