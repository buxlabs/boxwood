const { html, head, body, script } = require("boxwood")

module.exports = () => {
  return html([
    head([
      script(),
      script({ type: "application/json" }, "{}"),
      script({ type: "application/ld+json" }, "{}"),
    ]),
    body(),
  ])
}
