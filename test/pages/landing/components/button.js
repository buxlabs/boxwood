const { Button, component, css } = require("../../../..")
const { join } = require("path")
const styles = css.load(join(__dirname, "button.css"))

module.exports = component(
  ({ className }, children) => {
    return Button({ class: [className, styles.button] }, children)
  },
  { styles }
)
