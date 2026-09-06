const { component, js, Html, Head, Body } = require("../../..")

// The same script written twice with different indentation - deduplication
// compares the parsed form, not the raw string
module.exports = component(() => Html([Head([]), Body([])]), {
  scripts: [js`window.hello = 1`, js`   window.hello   =   1   `],
})
