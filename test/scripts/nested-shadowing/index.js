const { component, js, Html, Head, Body } = require("../../..")

// The second script declares `state` inside a callback, which is already
// scoped and cannot collide with anything
module.exports = component(() => Html([Head([]), Body([])]), {
  scripts: [
    js`const state = 1
       window.first = state`,
    js`document.addEventListener('click', function () {
         const state = 2
         window.second = state
       })`,
  ],
})
