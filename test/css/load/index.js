const { Div, css, component } = require("../../..")

const styles = css.load(__dirname)

module.exports = component(() => Div({ class: styles.foo }), { styles })
