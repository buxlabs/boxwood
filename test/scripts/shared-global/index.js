const { component, js, Html, Head, Body } = require("../../..")

// The second script reads a name defined by the first one, so isolating it
// would break it
module.exports = component(() => Html([Head([]), Body([])]), {
  scripts: [
    js`function helper(value) { return value * 2 }`,
    js`window.result = helper(21)`,
  ],
})
