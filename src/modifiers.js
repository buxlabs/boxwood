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
  rotate: 'reverse',
  mean: 'average'
}

function getModifierName (modifier) {
  return aliases[modifier] || modifier
}

module.exports = {
  getModifierName,
  getModifier (modifier) {
    const tree = new AbstractSyntaxTree(modifier)
    const node = tree.body()[0].expression
    let name = node.type === 'CallExpression' ? node.callee.name : node.name
    name = getModifierName(name)
    const method = utilities.string[name] ||
      utilities.math[name] ||
      utilities.json[name] ||
      utilities.array[name] ||
      utilities.object[name] ||
      utilities.collection[name] ||
      utilities.date[name]
    if (!method) return null
    const leaf = new AbstractSyntaxTree(method.toString())
    const fn = leaf.body()[0]
    fn.id.name = name
    return fn
  }
}
