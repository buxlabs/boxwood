const { component, Div, css, js, Html, Head, Body } = require("../../..")

module.exports = component(
  () => {
    return Html([Head([]), Body([Div(["hello, world!"])])])
  },
  {
    styles: css`
      div {
        color: red;
      }
    `,
    scripts: js`alert('hello, world!')`,
  }
)
