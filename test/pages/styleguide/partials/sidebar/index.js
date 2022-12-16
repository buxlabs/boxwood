const { div } = require('../../../../..')
const styles = require('./css')

module.exports = () => {
  return [
    div({ class: styles.sidebar }, []),
    styles.css
  ]
}
