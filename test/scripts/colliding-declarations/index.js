const { component, js, Html, Head, Body } = require("../../..")

// Two components declaring the same top level name used to break the entire
// bundle with a SyntaxError
module.exports = component(() => Html([Head([]), Body([])]), {
  scripts: [
    js`const state = { open: false }
       window.first = state.open`,
    js`const state = { open: true }
       window.second = state.open`,
  ],
})
