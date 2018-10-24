const { readFileSync } = require('fs')
const { load } = require('yaml-js')
const { extname } = require('path')
const { assign } = Object

function mergeTranslations (value, translations, languages, translationsPaths) {
  const merged = translations
  if (!merged[value] && translationsPaths) {
    translationsPaths.forEach(path => {
      const extension = extname(path)
      const loaded = extension === '.yaml' ? load(readFileSync(path, 'utf8')) : JSON.parse(readFileSync(path, 'utf8'))
      if (loaded[value] && !merged[value]) {
        merged[value] = loaded[value]
      } else if (loaded[value] && merged[value]) {
        throw new Error(`Translation already exists in ${path}`)
      }
    })
  }
  if (!merged[value]) throw new Error(`There is no translation for the ${value} key`)
  languages.forEach((language, index) => {
    if(!merged[value][index]) throw new Error(`There is no translation for the ${value} key in ${language} language.`)
  })
  return merged
}

module.exports = {
  mergeTranslations
}

