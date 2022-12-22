const { css, span } = require('../../..')
const styles = css.load(__dirname, 'index.css')

module.exports = ({ direction }) => {
  return span({ class: [styles.arrow, { [styles[direction]]: direction }] }, [])
}
