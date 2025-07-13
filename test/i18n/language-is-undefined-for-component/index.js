const { component, Div } = require("../../..")
const i18n = require("./i18n")

module.exports = component(
  ({ translate }) => {
    return Div([translate("foo")])
  },
  { i18n }
)
