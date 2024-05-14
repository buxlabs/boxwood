const { component, js, html, head, body } = require("../../..")

module.exports = component(
  () => {
    return html([head([]), body([])])
  },
  {
    scripts: [js`alert('foo');`, js`alert('bar');`],
  }
)
