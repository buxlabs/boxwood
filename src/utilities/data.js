const AbstractSyntaxTree = require('abstract-syntax-tree')
const { load } = require('yaml-js')
const { TranslationError } = require('./errors')

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

function parseData (format, content) {
  if (format === '.yaml') return parseYAML(content)
  if (format === '.json') return parseJSON(content)
  return parseJS(content)
}

function getDataFormat (keys) {
  if (keys.includes('yaml')) return '.yaml'
  if (keys.includes('json')) return '.json'
  return 'js'
}

module.exports = {
  parseData,
  getDataFormat
}
