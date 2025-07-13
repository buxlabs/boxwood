const { component, js, Html, Head, Body } = require("../../..")

module.exports = component(
  () => {
    return Html([Head([]), Body([])])
  },
  {
    scripts: [js`alert('foo');`, js`alert('bar');`],
  }
)
