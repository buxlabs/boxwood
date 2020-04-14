'use strict'

const { findAsset } = require('../utilities/files')
const Plugin = require('./Plugin')
const hash = require('string-hash')
const { parseData, getDataFormat } = require('../utilities/data')
const { TranslationError } = require('../utilities/errors')

function merge (value, translations, languages) {
  if (value.includes('{') && value.includes('}')) return translations
  if (!translations[value]) throw new TranslationError(`There is no translation for the ${value} key`)
  languages.forEach((language, index) => {
    if (!translations[value][index] && !translations[value][language]) throw new TranslationError(`There is no translation for the ${value} key in ${language} language.`)
  })
  return translations
}

function getExtension (path) {
  const values = path.split('.')
  return values[values.length - 1]
}

function isI18nTag (tag, keys) {
  return (tag === 'script' && keys.includes('i18n')) || tag === 'i18n'
}

function isDataTag (tag) {
  return tag === 'data'
}

function hasTranslateModifier (attribute) {
  return attribute.key.endsWith('|translate')
}

class InternationalizationPlugin extends Plugin {
  constructor ({ translations, filters }) {
    super()
    this.translations = translations
    this.filters = filters
  }

  prerun ({ source, tag, attrs, keys, fragment, assets, options }) {
    const id = `__scope_${hash(source)}`
    if (isI18nTag(tag, keys)) {
      fragment.used = true
      let leaf = fragment.children[0]
      if (keys.includes('from')) {
        const { value: path } = attrs.find(attr => attr.key === 'from')
        const asset = findAsset(path, assets, options)
        if (!asset) return
        leaf = { content: asset.source }
        leaf.used = true
        keys.push(getExtension(path))
      } else if (!leaf || !leaf.content || !leaf.content.trim()) {
        throw new TranslationError('The translation script cannot be empty')
      }
      leaf.used = true
      const format = getDataFormat(keys)
      const data = parseData(format, leaf.content)
      for (const key in data) {
        if (this.translations[key]) { throw new TranslationError('Translation already exists') }
        this.translations[`${key}_${id}`] = data[key]
      }
    } else if (isDataTag(tag)) {
      const format = getDataFormat(keys)
      const leaf = fragment.children[0]
      const data = parseData(format, leaf.content)
      const { i18n } = data
      for (const key in i18n) {
        if (this.translations[key]) { throw new TranslationError('Translation already exists') }
        this.translations[`${key}_${id}`] = i18n[key]
      }
    }
    attrs.forEach(attr => {
      if (hasTranslateModifier(attr)) {
        attr.key = attr.key.substring(0, attr.key.indexOf('|translate'))
        attr.value = `{"${attr.value}_${id}"|translate(language)}`
      }
    })
  }

  run ({ source, tag, attrs, options, fragment }) {
    const id = `__scope_${hash(source)}`
    if (tag === 'translate' && !fragment.scopedTranslations) {
      fragment.scopedTranslations = true
      const { languages } = options
      const attribute = attrs[0]
      if (attribute) {
        const { key } = attribute
        this.filters.push('translate')
        this.translations = merge(`${key.split('|')[0]}_${id}`, this.translations, languages)
        attribute.key = `${key}_${id}`
      } else {
        throw new TranslationError('Translate tag must define a key')
      }
    }
  }
}

module.exports = InternationalizationPlugin
