const { a } = require("../../..")

module.exports = () => {
  return [a({ href: "/foo" }, "bar"), a({ href: "/baz" }), a("qux")]
}
