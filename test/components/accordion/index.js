const { join } = require("path")
const { component, css, Div, js, H3 } = require("../../..")
const styles = css.load(__dirname)

/*
 * Classes style, data attributes drive. The script needs no interpolation
 * once its hooks are attributes, so it lives in client.js as ordinary code.
 */
module.exports = component(
  ({ title }, children) => {
    return [
      H3({ class: styles.accordion, "data-accordion": "" }, title),
      Div(
        { class: styles.content, "data-content": "", "data-hidden": "" },
        children,
      ),
    ]
  },
  {
    styles,
    scripts: [js.load(join(__dirname, "client.js"))],
  },
)
