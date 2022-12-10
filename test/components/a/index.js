const { a, classes, css } = require('../../..')

const styles = css`
  .link {
    color: #4183c4;
    cursor: pointer;
    text-decoration: none;
  }
`

module.exports = ({ className, href, target }, children = []) => {
  return [
    a({ class: classes(styles.link, className), href, target }, children),
    styles.css,
  ]
}
