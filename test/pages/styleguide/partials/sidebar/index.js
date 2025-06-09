const { component, css, div } = require("../../../../..")
const { join } = require("path")
const styles = css.load(join(__dirname, "index.css"))

module.exports = component(
  () => {
    return div({ class: styles.sidebar }, [])
  },
  { styles }
)
