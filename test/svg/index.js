const { div, raw } = require('../..')

const line = raw.load(__dirname, 'line.svg')

module.exports = () => {
  return div(line)
}
