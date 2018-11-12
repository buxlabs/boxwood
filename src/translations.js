const { readFileSync } = require('fs')
const { load } = require('yaml-js')
const { extname } = require('path')

function readTranslations (path) {
  const content = readFileSync(path, 'utf8')
  const extension = extname(path)
  return extension === '.yaml' ? load(content) : JSON.parse(content)
}

function mergeTranslations (value, translations, languages, paths) {
  if (!translations[value] && paths) {
    paths.forEach(path => {
      const data = readTranslations(path)
      if (data[value]) {
        if (!translations[value]) {
          translations[value] = data[value]
        } else {
          throw new Error(`Translation already exists in ${path}`)
        }
      }
    })
  }
  if (!translations[value]) throw new Error(`There is no translation for the ${value} key`)
  languages.forEach((language, index) => {
    if (!translations[value][index]) throw new Error(`There is no translation for the ${value} key in ${language} language.`)
  })
  return translations
}

module.exports = {
  mergeTranslations
}
