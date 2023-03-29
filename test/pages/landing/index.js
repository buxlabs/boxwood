const { component, yaml } = require("../../..")
const layout = require("./layouts/default")
const button = require("./components/button")

const i18n = yaml.load(__dirname)

module.exports = component(
  ({ language, translate }) => layout({ language }, [button(translate("foo"))]),
  { i18n }
)
