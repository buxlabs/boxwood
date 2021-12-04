const AbstractSyntaxTree = require('abstract-syntax-tree')
const { transpileExpression } = require('../expression')
const { isCurlyTag } = require('../../../utilities/string')

const { BlockStatement, Literal, Identifier, IfStatement, ReturnStatement } = AbstractSyntaxTree

function mapIfStatement (htmlNode, parent, index = 0, transpileNode) {
  function mapAttributesToTest ({ attributes }) {
    if (attributes.length === 1) {
      if (attributes[0].key === 'true' || attributes[0].key === '{true}') {
        return new Literal(true)
      } else if (attributes[0].key === 'false' || attributes[0].key === '{false}') {
        return new Literal(false)
      } else if (isCurlyTag(attributes[0].key)) {
        return transpileExpression(attributes[0].key)
      } else {
        return new Identifier({ name: attributes[0].key, parameter: true })
      }
    }
    throw new Error('Unsupported length of attributes (if)')
  }

  function mapCurrentNodeToConsequent (htmlNode) {
    const body = htmlNode.children.map((node, index) => transpileNode({ node, parent: htmlNode.children, index })).filter(Boolean)
    const argument = body.pop() || new Literal('')
    body.push(new ReturnStatement({ argument }))
    return new BlockStatement({ body })
  }

  function mapNextNodeToAlternate (nextNode) {
    if (nextNode && nextNode.tagName === 'else') {
      const body = nextNode.children.map((node, index) => transpileNode({ node, parent: nextNode.children, index })).filter(Boolean)
      const argument = body.pop()
      body.push(new ReturnStatement({ argument }))
      return new BlockStatement({ body })
    } else if (nextNode && nextNode.tagName === 'elseif') {
      return mapIfStatement(nextNode, parent, index + 1, transpileNode)
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
    test: mapAttributesToTest(htmlNode),
    consequent: mapCurrentNodeToConsequent(htmlNode),
    alternate: mapNextNodeToAlternate(parent[index + 1])
  })
}

module.exports = mapIfStatement
