const AbstractSyntaxTree = require('abstract-syntax-tree')
const YAML = require('yaml')
const { YAMLTranslationError, JSONTranslationError, JavaScriptTranslationError } = require('./errors')

function parseYAML (content) {
  try {
    return YAML.parse(content)
  } catch (exception) {
    const error = new YAMLTranslationError('YAML translation is unparseable')
    error.message = exception.message
    throw error
  }
}

function parseJSON (content) {
  try {
    return JSON.parse(content)
  } catch (exception) {
    const error = new JSONTranslationError('JSON translation is unparseable')
    error.message = exception.message
    throw error
  }
}

function parseJS (content) {
  try {
    const tree = new AbstractSyntaxTree(content)
    const node = tree.first('ExportDefaultDeclaration')
    return AbstractSyntaxTree.serialize(node.declaration)
  } catch (exception) {
    const error = new JavaScriptTranslationError('JS translation is unparseable')
    error.message = exception.message
    return error
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
  parseYAML,
  parseJSON,
  parseJS,
  parseData,
  getDataFormat
}
