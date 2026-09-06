const { component, js, Html, Head, Body } = require("../../..")

// Neither script ends with a semicolon - concatenating them as strings used to
// turn the first one into a call of the second
module.exports = component(() => Html([Head([]), Body([])]), {
  scripts: [js`const first = 1`, js`(function () { window.second = 2 }())`],
})
