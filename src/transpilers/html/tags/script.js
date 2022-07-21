const { CallExpression, Identifier, Literal, ObjectExpression, Property } = require('abstract-syntax-tree')
const any = require('./any')

function mapAttributes (attributes) {
  function getAttributeValue (value) {
    if (value === null) { return new Literal(true) }
    return new Literal(value)
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

function getContent (htmlNode) {
  if (htmlNode.children.length > 0) {
    return htmlNode.children[0].content
  }
  return ''
}

module.exports = function scriptTag (htmlNode, transpileNode) {
  const type = htmlNode.attributes.find(attribute => attribute.key === 'type')
  if (type && ['application/json', 'application/ld+json'].includes(type.value)) {
    return any(htmlNode, transpileNode)
  }
  const content = getContent(htmlNode)
  return new CallExpression({
    callee: new Identifier('tag'),
    arguments: [
      new Literal('script'),
      mapAttributes(htmlNode.attributes),
      new Literal(content)
    ].filter(Boolean)
  })
}
