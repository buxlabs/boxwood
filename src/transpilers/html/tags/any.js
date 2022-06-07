const AbstractSyntaxTree = require('abstract-syntax-tree')
const { transpileExpression } = require('../expression')

const {
  ArrayExpression,
  CallExpression,
  Identifier,
  Literal,
  ObjectExpression,
  Property
} = AbstractSyntaxTree

function mapAttributes (attributes) {
  function getAttributeValue (value) {
    if (value === null) { return new Literal(true) }
    return transpileExpression(value, false)
  }
  return attributes.length > 0
    ? new ObjectExpression({
      properties: attributes.map(attribute => {
        return new Property({
          key: new Identifier(attribute.key),
          value: getAttributeValue(attribute.value),
          kind: 'init',
          computed: false,
          method: false,
          shorthand: false
        })
      })
    })
    : new ObjectExpression({ properties: [] })
}
function mapChildren (children, transpileNode) {
  return children.length > 0 && new ArrayExpression({
    elements: children.map((childNode, index) => {
      return transpileNode({ node: childNode, parent: children, index })
    }).filter(Boolean)
  })
}

function any (htmlNode, transpileNode) {
  const { tagName, attributes, children } = htmlNode
  return new CallExpression({
    callee: new Identifier('tag'),
    arguments: [
      new Literal(tagName),
      mapAttributes(attributes),
      mapChildren(children, transpileNode)
    ].filter(Boolean)
  })
}

module.exports = any
