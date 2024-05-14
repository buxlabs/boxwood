const { div, i18n } = require("../../..")

const translate = i18n.load(__dirname, "index.json")

module.exports = ({ language }) => {
  return div([translate(language, "foo")])
}
