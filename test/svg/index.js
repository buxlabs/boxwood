const { div, raw, svg, tag } = require('../..')

const line = raw.load(__dirname, 'line.svg')

module.exports = () => {
  return div([
    line,
    svg([
      tag('rect')
    ])
  ])
}
