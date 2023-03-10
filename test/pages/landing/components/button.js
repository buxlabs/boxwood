const { button, component, css } = require("../../../..")
const styles = css.load(__dirname, "button.css")

module.exports = component(({ className }, children) => {
  return button({ class: [className, styles.button] }, children)
}, styles)
