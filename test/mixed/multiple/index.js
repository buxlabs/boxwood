const { component, css, js, html, head, body, div, p } = require("../../..")

module.exports = component(
  () => {
    return html([head([]), body([div("foo"), p("bar")])])
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
