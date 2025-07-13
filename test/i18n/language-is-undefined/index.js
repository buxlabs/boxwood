const { Div, i18n } = require("../../..")

const translate = i18n.load(__dirname, "index.json")

module.exports = () => {
  return Div([translate()])
}
