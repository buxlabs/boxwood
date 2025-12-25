const { Div, i18n, raw } = require("../../..")

const translate = i18n.load(__dirname, { sanitize: false })

module.exports = ({ language }) => {
  return Div([raw(translate(language, "greeting"))])
}
