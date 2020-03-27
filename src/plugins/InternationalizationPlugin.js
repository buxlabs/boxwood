'use strict'

const AbstractSyntaxTree = require('abstract-syntax-tree')
const { load } = require('yaml-js')
const { findAsset } = require('../utilities/files')
const Plugin = require('./Plugin')
const hash = require('string-hash')
const { TranslationError } = require('../utilities/errors')

function parseYAML (content) {
  try {
    return load(content)
  } catch (exception) {
    throw new TranslationError('YAML translation is unparseable')
  }
}

function parseJSON (content) {
  try {
    return JSON.parse(content)
  } catch (exception) {
    throw new TranslationError('JSON translation is unparseable')
  }
}

function parseJS (content) {
  try {
    const tree = new AbstractSyntaxTree(content)
    const node = tree.first('ExportDefaultDeclaration')
    return AbstractSyntaxTree.serialize(node.declaration)
  } catch (exception) {
    throw new TranslationError('JS translation is unparseable')
  }
}

function parse (format, content) {
  if (format === '.yaml') return parseYAML(content)
  if (format === '.json') return parseJSON(content)
  return parseJS(content)
}

function merge (value, translations, languages) {
  if (value.includes('{') && value.includes('}')) return translations
  if (!translations[value]) throw new TranslationError(`There is no translation for the ${value} key`)
  languages.forEach((language, index) => {
    if (!translations[value][index]) throw new TranslationError(`There is no translation for the ${value} key in ${language} language.`)
  })
  return translations
}

function getExtension (path) {
  const values = path.split('.')
  return values[values.length - 1]
}

function getTranslationsFormat (keys) {
  if (keys.includes('yaml')) return '.yaml'
  if (keys.includes('json')) return '.json'
  return 'js'
}

function isI18nTag (tag, keys) {
  return (tag === 'script' && keys.includes('i18n')) || tag === 'i18n'
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
      const format = getTranslationsFormat(keys)
      const data = parse(format, leaf.content)
      for (const key in data) {
        if (this.translations[key]) { throw new TranslationError('Translation already exists') }
        this.translations[`${key}_${id}`] = data[key]
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
