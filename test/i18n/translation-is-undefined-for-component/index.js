const { component, div, json } = require("../../..")

module.exports = component(
  ({ translate }) => {
    return div([translate("foo"), translate("bar")])
  },
  { i18n: json.load(__dirname, "i18n.json") }
)
