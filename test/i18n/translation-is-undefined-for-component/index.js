const { component, div, json } = require("../../..")
const { join } = require("path")

module.exports = component(
  ({ translate }) => {
    return div([translate("foo"), translate("bar")])
  },
  { i18n: json.load(join(__dirname, "i18n.json")) }
)
