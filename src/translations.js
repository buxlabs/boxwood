const AbstractSyntaxTree = require('abstract-syntax-tree')
const { load } = require('yaml-js')
const { readFileSync } = require('fs')
const { extname } = require('path')
const convert = require('asttv')

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
    const ast = new AbstractSyntaxTree(content)
    const node = ast.first('ExportDefaultDeclaration')
    return convert(node.declaration)
  } catch (exception) {
    throw new Error('JS translation is unparseable')
  }
}

function parseTranslations (format, content) {
  if (format === '.yaml') return parseYAML(content)
  if (format === '.json') return parseJSON(content)
  return parseJS(content)
}

function readTranslations (path) {
  const content = readFileSync(path, 'utf8')
  const extension = extname(path)
  return parseTranslations(extension, content)
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
  mergeTranslations,
  parseYAML,
  parseJSON,
  parseJS
}
