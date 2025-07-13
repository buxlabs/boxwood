const { component, css, H1, P, Section } = require("../../..")

const styles = css.load(__dirname)

module.exports = component(
  ({ title, description }) => {
    return Section({ className: styles.banner }, [
      H1(title),
      description && P(description),
    ])
  },
  { styles }
)
