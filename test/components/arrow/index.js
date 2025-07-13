const { css, Span } = require("../../..")
const styles = css.load(__dirname)

module.exports = ({ direction }) => {
  return Span({ class: [styles.arrow, { [styles[direction]]: direction }] }, [])
}
