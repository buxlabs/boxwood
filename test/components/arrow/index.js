const { css, span } = require('../../..')

const styles = css`
.arrow {
  border: solid black;
  border-width: 0 3px 3px 0;
  display: inline-block;
  padding: 3px;
}
.top {
  transform: rotate(-135deg);
}
.right {
  transform: rotate(-45deg);
}
.bottom {
  transform: rotate(45deg);
}
.left {
  transform: rotate(135deg);
}
`

module.exports = ({ direction }) => {
  return span({ class: [styles.arrow, { [styles[direction]]: direction }] }, [])
}
