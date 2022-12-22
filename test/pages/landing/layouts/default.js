const { css, doctype, html, head, title, style, body } = require('../../../..')
const styles = css.load(__dirname, 'default.css')

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
