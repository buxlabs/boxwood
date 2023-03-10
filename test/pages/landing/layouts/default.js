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
const styles = css.load(__dirname, "default.css")

module.exports = component(({ language }, children) => {
  return [
    doctype(),
    html({ lang: language }, [
      head([title("Landing page"), styles.css]),
      body(children),
    ]),
  ]
})
