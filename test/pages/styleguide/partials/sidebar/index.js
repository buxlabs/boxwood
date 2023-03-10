const { component, css, div } = require("../../../../..")
const styles = css.load(__dirname, "index.css")

module.exports = component(() => {
  return div({ class: styles.sidebar }, [])
}, styles)
