'use strict'

const AbstractSyntaxTree = require('abstract-syntax-tree')
const { transpileExpression } = require('./expression')
const tags = require('./tags')

const {
  ArrayExpression,
  BlockStatement,
  CallExpression,
  Identifier,
  IfStatement,
  Literal,
  ObjectExpression,
  Property,
  ReturnStatement
} = AbstractSyntaxTree

function transpileNode ({ node: htmlNode, parent, index }) {
  function mapAttributes (attributes) {
    return attributes.length > 0 && new ObjectExpression({
      properties: attributes.map(attribute => {
        return new Property({
          key: new Identifier({
            name: attribute.key
          }),
          value: new Literal({
            value: attribute.value
          }),
          kind: 'init',
          computed: false,
          method: false,
          shorthand: false
        })
      })
    })
  }
  function mapChildren (children) {
    return children.length > 0 && new ArrayExpression({
      elements: children.map((childNode, index) => {
        return transpileNode({ node: childNode, parent: children, index })
      }).filter(Boolean)
    })
  }
  function mapIfStatement (htmlNode, parent, index) {
    function mapAttributesToTest ({ attributes }) {
      if (attributes.length === 1) {
        if (attributes[0].key === 'true') {
          return new Literal({ value: true })
        } else if (attributes[0].key === 'false') {
          return new Literal({ value: false })
        }
      }
      throw new Error('unsupported')
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
      }
      return null
    }

    return new IfStatement({
      test: mapAttributesToTest(htmlNode),
      consequent: mapCurrentNodeToConsequent(htmlNode),
      alternate: mapNextNodeToAlternate(parent[index + 1])
    })
  }

  if (htmlNode.type === 'element' && htmlNode.tagName === 'if') {
    const statement = mapIfStatement(htmlNode, parent, index)
    const { expression } = AbstractSyntaxTree.iife(statement)
    return expression
  } else if (htmlNode.type === 'element' && htmlNode.tagName === 'else') {
    return null
  } else if (htmlNode.type === 'element') {
    if (htmlNode.tagName === 'import') { return tags.import(htmlNode) }
    if (htmlNode.tagName === '!doctype') { return tags.doctype() }
    if (htmlNode.tagName === 'partial') { return tags.partial(htmlNode) }
    const { tagName, attributes, children } = htmlNode
    const node = new CallExpression({
      callee: new Identifier({ name: 'tag' }),
      arguments: [
        new Literal({ value: tagName }),
        mapAttributes(attributes),
        mapChildren(children)
      ].filter(Boolean)
    })
    return node
  } else if (htmlNode.type === 'text') {
    const { content } = htmlNode
    return transpileExpression(content)
  } else if (htmlNode.type === 'comment') {
    return new Literal({ value: '' })
  }
}

module.exports = { transpileNode }
