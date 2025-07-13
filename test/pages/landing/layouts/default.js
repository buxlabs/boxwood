const {
  component,
  css,
  Doctype,
  Html,
  Head,
  Title,
  Style,
  Body,
} = require("../../../..")
const { join } = require("path")
const styles = css.load(join(__dirname, "default.css"))

module.exports = component(({ language }, children) => {
  return [
    Doctype(),
    Html({ lang: language }, [
      Head([Title("Landing page"), styles.css]),
      Body(children),
    ]),
  ]
})
