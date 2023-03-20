const { component, div, i18n } = require("../../../../..")
const accordion = require("../../../../components/accordion")
const image = require("../../../../components/image")

const translate = i18n({
  hey: {
    en: "Hey",
    pl: "Hej",
  },
})

module.exports = component(({ language }) => {
  return div([
    accordion({ title: "Section 1..." }, [translate(language, "hey")]),
    image({ src: "https://foo.com/bar" }),
    image({ src: "https://baz.com/qux" }),
  ])
})
