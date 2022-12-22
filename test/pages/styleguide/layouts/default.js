const { html, head, tag, meta, style, body, } = require('../../../..')

module.exports = ({ title, description }, children) => {
  return html([
    head([
      title && tag('title', title),
      style('body { background: #ccc; }'),
      description && meta({ name: 'description', content: description })
    ]),
    body(children)
  ])
}
