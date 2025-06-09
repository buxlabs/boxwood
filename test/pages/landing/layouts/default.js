const {
  component,
  css,
  doctype,
  html,
  head,
  title,
  style,
  body,
} = require("../../../..")
const { join } = require("path")
const styles = css.load(join(__dirname, "default.css"))

module.exports = component(({ language }, children) => {
  return [
    doctype(),
    html({ lang: language }, [
      head([title("Landing page"), styles.css]),
      body(children),
    ]),
  ]
})
