const { component, css, js, Html, Head, Body, Div, P } = require("../../..")

module.exports = component(
  () => {
    return Html([Head([]), Body([Div("foo"), P("bar")])])
  },
  {
    styles: [
      css`
        div {
          color: red;
        }
      `,
      css`
        p {
          color: blue;
        }
      `,
    ],
    scripts: [js`alert('foo');`, js`alert('bar');`],
  }
)
