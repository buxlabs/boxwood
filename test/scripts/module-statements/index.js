const { component, js, Html, Head, Body } = require("../../..")

module.exports = component(() => Html([Head([]), Body([])]), {
  scripts: [js`export const shared = 1`],
})
