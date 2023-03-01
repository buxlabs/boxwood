const { div, i18n } = require("../../../../..")
const accordion = require("../../../../components/accordion")

const translate = i18n({
  hey: {
    en: "Hey",
    pl: "Hej",
  },
})

module.exports = ({ language }) => {
  return div([
    accordion({ title: "Section 1..." }, [translate(language, "hey")]),
  ])
}
