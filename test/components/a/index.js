const { a, css } = require("../../..")
const styles = css.load(__dirname)

module.exports = ({ className, href, target }, children = []) => {
  return [
    a({ class: [styles.link, className], href, target }, children),
    styles.css,
  ]
}
