const AbstractSyntaxTree = require('abstract-syntax-tree')
const ifTag = require('./if')

const { Identifier, Literal, IfStatement, ReturnStatement, BlockStatement, UnaryExpression } = AbstractSyntaxTree

function mapUnlessStatement (htmlNode, parent, index, transpileNode) {
  function mapAttributesToTest ({ attributes }) {
    if (attributes.length === 1) {
      if (attributes[0].key === 'true' || attributes[0].key === '{true}') {
        return new Literal(true)
      } else if (attributes[0].key === 'false' || attributes[0].key === '{false}') {
        return new Literal(false)
      } else {
        return new Identifier({ name: attributes[0].key, parameter: true })
      }
    }
    throw new Error('Unsupported length of attributes (unless)')
  }

  function mapCurrentNodeToConsequent (htmlNode) {
    const body = htmlNode.children.map((node, index) => transpileNode({ node, parent: htmlNode.children, index })).filter(Boolean)
    const argument = body.pop()
    body.push(new ReturnStatement({ argument }))
    return new BlockStatement({ body })
  }

  function mapNextNodeToAlternate (nextNode) {
    if (nextNode && nextNode.tagName === 'else') {
      const body = nextNode.children.map((node, index) => transpileNode({ node, parent: nextNode.children, index })).filter(Boolean)
      const argument = body.pop()
      body.push(new ReturnStatement({ argument }))
      return new BlockStatement({ body })
    } else if (nextNode && nextNode.tagName === 'elseunless') {
      return mapUnlessStatement(nextNode, parent, index + 1, transpileNode)
    } else if (nextNode && nextNode.tagName === 'elseif') {
      return ifTag(nextNode, parent, index + 1, transpileNode)
    }
    return new BlockStatement({
      body: [
        new ReturnStatement({
          argument: new Literal('')
        })
      ]
    })
  }

  return new IfStatement({
    test: new UnaryExpression({
      operator: '!',
      argument: mapAttributesToTest(htmlNode),
      prefix: true
    }),
    consequent: mapCurrentNodeToConsequent(htmlNode),
    alternate: mapNextNodeToAlternate(parent[index + 1])
  })
}

module.exports = mapUnlessStatement
