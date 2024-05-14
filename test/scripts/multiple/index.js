const { component, js, html, head, body } = require("../../..")

module.exports = component(
  () => {
    return html([head([]), body([])])
  },
  {
    scripts: [js`console.log('foo');`, js`console.log('bar');`],
  }
)
