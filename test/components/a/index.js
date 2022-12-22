const { a, css } = require('../../..')

const styles = css`
  .link {
    color: #4183c4;
    cursor: pointer;
    text-decoration: none;
  }
`

module.exports = ({ className, href, target }, children = []) => {
  return [
    a({ class: [styles.link, className], href, target }, children),
    styles.css,
  ]
}
