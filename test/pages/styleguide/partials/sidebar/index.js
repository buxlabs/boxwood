const { div } = require('../../../../..')
const styles = require('./css')

module.exports = (children) => {
  return [
    div({ class: styles.sidebar }, children),
    styles.css
  ]
}
