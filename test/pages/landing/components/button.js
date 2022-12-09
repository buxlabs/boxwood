const { button } = require('../../../..')
const styles = require('./css')

module.exports = (children) => {
  return [
    button({ class: styles.button }, children),
    styles.css
  ]
}
