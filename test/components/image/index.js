const { component, css, Img } = require("../../..")
const styles = css.load(__dirname)

module.exports = component(
  (src) => {
    return Img({ className: styles.image, src })
  },
  { styles }
)
