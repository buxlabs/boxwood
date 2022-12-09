const { button } = require('../../../..')
const styles = require('./styles')

module.exports = (children) => {
  return [
    button({ class: styles.button }, children),
    styles.css
  ]
}
