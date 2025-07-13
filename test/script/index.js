const { Html, Head, Body, Script } = require("../..")

module.exports = () => {
  return Html([
    Head([
      Script(),
      Script({ type: "application/json" }, "{}"),
      Script({ type: "application/ld+json" }, "{}"),
    ]),
    Body(),
  ])
}
