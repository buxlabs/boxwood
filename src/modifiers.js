const AbstractSyntaxTree = require('@buxlabs/ast')
const utils = require('@buxlabs/utils')

const aliases = {
  json: 'prettify',
  inspect: 'prettify',
  upcase: 'uppercase',
  downcase: 'lowercase',
  titlecase: 'titleize'
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
    const method = utils.string[name] || utils.math[name] || utils.json[name] || utils.array[name]
    if (!method) return null
    const leaf = new AbstractSyntaxTree(method.toString())
    const fn = leaf.body()[0]
    fn.id.name = name
    return fn
  }
}
