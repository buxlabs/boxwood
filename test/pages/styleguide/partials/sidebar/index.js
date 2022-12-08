const { div, style, fragment } = require('../../../../..')
const { classes, styles } = require('./styles')

module.exports = (children) => {
  return fragment([
    div({ class: classes.sidebar }, children),
    style(styles)
  ])
}
