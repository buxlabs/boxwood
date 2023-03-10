const { i18n } = require("../../..")
const layout = require("./layouts/default")
const button = require("./components/button")

const translate = i18n.load(__dirname, "index.yaml")

module.exports = ({ language }) =>
  layout({ language }, [
    button(translate("pl", "foo")),
    button(translate("en", "foo")),
  ])
