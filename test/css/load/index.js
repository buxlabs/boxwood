const { div, css, component } = require("../../..")

const styles = css.load(__dirname)

module.exports = component(() => div({ class: styles.foo }), { styles })
