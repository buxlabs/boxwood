const { css, doctype, html, head, title, style, body } = require('../../../..')

const styles = css`
body {
  background: #ccc;
  font-family: "Lato";
}
`

module.exports = (children) => {
  return [
    doctype(),
    html([
      head([
        title('Landing page'),
        styles.css
      ]),
      body(children)
    ])
  ]
}
