const { component, div, css, js, html, head, body } = require("../..")

module.exports = component(
  () => {
    return html([head([]), body([div(["hello, world!"])])])
  },
  {
    styles: css`
      div {
        color: red;
      }
    `,
    scripts: js`console.log('hello, world!')`,
  }
)
