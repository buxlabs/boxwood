const { component, css, img } = require("../../..")
const styles = css.load(__dirname)

module.exports = component(
  (src) => {
    return img({ className: styles.image, src })
  },
  { styles }
)
