const { button, fragment, style } = require('../../../..')
const { classes, styles } = require('./styles')

module.exports = (children) => {
  return fragment([
    button({ class: classes.button }, children),
    style(styles)
  ])
}
