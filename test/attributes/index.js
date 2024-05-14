const { a } = require("boxwood")

module.exports = () => {
  return [a({ href: "/foo" }, "bar"), a({ href: "/baz" }), a("qux")]
}
