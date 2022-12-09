const { div } = require('../../../../..')
const styles = require('./styles')

module.exports = (children) => {
  return [
    div({ class: styles.sidebar }, children),
    styles.css
  ]
}
