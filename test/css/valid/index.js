const { css, Html, Head, Body } = require("../../..")
const { join } = require("path")

const styles = css.load(join(__dirname))

module.exports = () => {
  return Html([
    Head([]),
    Body([
      styles.css
    ])
  ])
}
