const { component, Div, json } = require("../../..")
const { join } = require("path")

module.exports = component(
  ({ translate }) => {
    return Div([translate("foo"), translate("bar")])
  },
  { i18n: json.load(join(__dirname, "i18n.json")) }
)
