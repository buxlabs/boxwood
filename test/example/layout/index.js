const { component, css, Doctype, Html, Body } = require("../../..")
const head = require("./head")

const styles = css.load(__dirname)

module.exports = component(
  ({ language }, children) => {
    return [
      Doctype(),
      Html({ lang: language }, [
        head(),
        Body({ className: styles.layout }, children),
      ]),
    ]
  },
  { styles }
)
