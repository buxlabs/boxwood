import { div } from "boxwood"

function i18n (data, language) {
  return function (key) {
    return data[key][language]
  }
}

export default function app ({ language }) {
  const translate = i18n({
    hello: {
      en: 'Hello!',
      pl: 'Hej!'
    }
  }, language)
  return div(translate('hello'))
}
