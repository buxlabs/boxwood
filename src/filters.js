const AbstractSyntaxTree = require('abstract-syntax-tree')
const utilities = require('pure-utilities')

const aliases = {
  json: 'prettify',
  inspect: 'prettify',
  upcase: 'uppercase',
  downcase: 'lowercase',
  titlecase: 'titleize',
  plus: 'add',
  minus: 'subtract',
  uncapitalize: 'lowerfirst',
  abbreviate: 'truncate',
  mean: 'average',
  count: 'size',
  length: 'size'
}

function getFilterName (filter) {
  return aliases[filter] || filter
}

function translate (key, language) {
  const translations = {}
  const languages = []
  const index = languages.indexOf(language)
  return translations[key][index]
}

function getPropertyKey (value) {
  if (value.includes('.')) {
    return { type: 'Literal', value }
  }
  return { type: 'Identifier', name: value }
}

function serializeProperties (translations) {
  const properties = []
  for (let key in translations) {
    properties.push({
      type: 'Property',
      key: getPropertyKey(key),
      value: {
        type: 'ArrayExpression',
        elements: translations[key].map(text => { return { type: 'Literal', value: text } })
      },
      kind: 'init'
    })
  }
  return properties
}

function serializeLanguages (languages) {
  if (!languages) throw new Error('Compiler option is undefined: languages.')
  return languages.map(language => { return { type: 'Literal', value: language } })
}

function extractFilterName (filter) {
  const tree = new AbstractSyntaxTree(filter)
  const node = tree.body[0].expression
  return node.type === 'CallExpression' ? node.callee.name : node.name
}

const builtins = { translate }

module.exports = {
  getFilterName,
  extractFilterName,
  getFilter (filter, translations, options) {
    let name = extractFilterName(filter)
    name = getFilterName(name)
    const method = utilities.string[name] ||
      utilities.math[name] ||
      utilities.json[name] ||
      utilities.array[name] ||
      utilities.object[name] ||
      utilities.collection[name] ||
      utilities.date[name] ||
      builtins[name]
    if (!method) return null
    const leaf = new AbstractSyntaxTree(method.toString())
    const fn = leaf.body[0]
    if (name === 'translate') {
      fn.body.body[0].declarations[0].init.properties = serializeProperties(translations)
      fn.body.body[1].declarations[0].init.elements = serializeLanguages(options.languages)
    }
    fn.id.name = name
    return fn
  }
}
