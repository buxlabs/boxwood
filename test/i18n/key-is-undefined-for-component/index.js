const { component, div } = require("../../..")
const i18n = require("./i18n")

module.exports = component(
  ({ translate }) => {
    return div([translate()])
  },
  { i18n }
)
