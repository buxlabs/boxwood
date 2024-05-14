const { component } = require("../../..")
const layout = require("./layouts/default")
const button = require("./components/button")
const i18n = require("./i18n")

module.exports = component(
  ({ language, translate }) => layout({ language }, [button(translate("foo"))]),
  { i18n }
)
