const { Div, i18n } = require("../../..")

const translate = i18n.load(__dirname, "index.json")

module.exports = ({ language }) => {
  return Div([translate(language)])
}
