const { readFileSync } = require('fs')
const { extname } = require('path')
const AbstractSyntaxTree = require('abstract-syntax-tree')
const serialize = require('asttv')
const { load } = require('yaml-js')
const { findAsset } = require('../files')
const { getTemplateAssignmentExpression, getTranslateCallExpression } = require('../factory')
const Plugin = require('./Plugin')
const hash = require('string-hash')

function parseYAML (content) {
  try {
    return load(content)
  } catch (exception) {
    throw new Error('YAML translation is unparseable')
  }
}

function parseJSON (content) {
  try {
    return JSON.parse(content)
  } catch (exception) {
    throw new Error('JSON translation is unparseable')
  }
}

function parseJS (content) {
  try {
    const tree = new AbstractSyntaxTree(content)
    const node = tree.first('ExportDefaultDeclaration')
    return serialize(node.declaration)
  } catch (exception) {
    throw new Error('JS translation is unparseable')
  }
}

function parse (format, content) {
  if (format === '.yaml') return parseYAML(content)
  if (format === '.json') return parseJSON(content)
  return parseJS(content)
}

function merge (value, translations, languages, paths) {
  if (!translations[value] && paths) {
    paths.forEach(path => {
      const content = readFileSync(path, 'utf8')
      const extension = extname(path)
      const data = parse(extension, content)
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

function getExtension (path) {
  const values = path.split('.')
  return values[values.length - 1]
}

function getTranslationsFormat (keys) {
  if (keys.includes('yaml')) return '.yaml'
  if (keys.includes('json')) return '.json'
  return 'js'
}

class InternationalizationPlugin extends Plugin {
  constructor ({ translations, filters }) {
    super()
    this.translations = translations
    this.filters = filters
  }
  prerun ({ source, tag, attrs, keys, fragment, assets, options }) {
    const id = `__scope_${hash(source)}`
    if ((tag === 'script' && keys.includes('i18n')) || tag === 'i18n') {
      fragment.used = true
      let leaf = fragment.children[0]
      if (!leaf) {
        if (keys.includes('from')) {
          const { value: path } = attrs.find(attr => attr.key === 'from')
          const asset = findAsset(path, assets, options)
          if (!asset) return
          leaf = { content: asset.source }
          leaf.used = true
          keys.push(getExtension(path))
        } else {
          throw new Error('The translation script cannot be empty')
        }
      }
      leaf.used = true
      const format = getTranslationsFormat(keys)
      let data = parse(format, leaf.content)
      for (let key in data) {
        if (this.translations[key]) { throw new Error('Translation already exists') }
        this.translations[`${key}_${id}`] = data[key]
      }
    }
  }
  run ({ source, tag, attrs, options, fragment }) {
    const id = `__scope_${hash(source)}`
    if (tag === 'translate') {
      fragment.used = true
      const { languages } = options
      const attribute = attrs[0]
      if (attribute) {
        const { key } = attribute
        this.filters.push('translate')
        this.translations = merge(`${key}_${id}`, this.translations, languages)
        return getTemplateAssignmentExpression(options.variables.template, getTranslateCallExpression(`${key}_${id}`))
      } else {
        throw new Error('Translate tag must define a key')
      }
    }
  }
}

module.exports = InternationalizationPlugin
