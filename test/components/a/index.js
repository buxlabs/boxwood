const { A, css } = require("../../..")
const styles = css.load(__dirname)

module.exports = ({ className, href, target }, children = []) => {
  return [
    A({ class: [styles.link, className], href, target }, children),
    styles.css,
  ]
}
