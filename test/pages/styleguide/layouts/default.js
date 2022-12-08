const { html, head, title, style, body } = require('../../../..')

module.exports = (children) => {
  return html([
    head([
      title('Landing page'),
      style('body { background: #ccc; }')
    ]),
    body(children)
  ])
}
