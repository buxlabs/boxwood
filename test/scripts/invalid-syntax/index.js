const { component, js, Html, Head, Body } = require("../../..")
const { join } = require("path")

module.exports = component(() => Html([Head([]), Body([])]), {
  scripts: [js.load(join(__dirname, "broken.js"))],
})
