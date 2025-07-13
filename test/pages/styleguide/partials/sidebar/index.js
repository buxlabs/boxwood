const { component, css, Div } = require("../../../../..")
const { join } = require("path")
const styles = css.load(join(__dirname, "index.css"))

module.exports = component(
  () => {
    return Div({ class: styles.sidebar }, [])
  },
  { styles }
)
