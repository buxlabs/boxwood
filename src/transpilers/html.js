'use strict'

const AbstractSyntaxTree = require('abstract-syntax-tree')
const { parse } = require('../utilities/html')

const program = (body) => {
  return AbstractSyntaxTree.program(
    AbstractSyntaxTree.template(`
      import { tag } from "boxwood"

      export default function () {
        return <%= body %>
      }
    `, { body })
  )
}

function reduce (htmlNode) {
  function mapAttributes (attributes) {
    return attributes.length > 0 && {
      type: 'ObjectExpression',
      properties: attributes.map(attribute => {
        return {
          type: 'Property',
          key: {
            type: 'Identifier',
            name: attribute.key
          },
          value: {
            type: 'Literal',
            value: attribute.value
          },
          kind: 'init',
          computed: false,
          method: false,
          shorthand: false
        }
      })
    }
  }
  function mapChildren (children) {
    return children.length > 0 && {
      type: 'ArrayExpression',
      elements: children.map(childNode => {
        return reduce(childNode)
      })
    }
  }

  if (htmlNode.type === 'element' && htmlNode.tagName === 'div') {
    const { tagName, attributes, children } = htmlNode
    const node = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'tag' },
      arguments: [
        { type: 'Literal', value: tagName },
        mapAttributes(attributes),
        mapChildren(children)
      ].filter(Boolean)
    }
    return node
  } else if (htmlNode.type === 'text') {
    const { content } = htmlNode
    return { type: 'Literal', value: content }
  }
}

function transpile (source, options) {
  const tree = parse(source)
  const reducedTree = tree.length === 1 ? reduce(tree[0]) : { type: 'ArrayExpression', elements: tree.map(reduce) }
  return new AbstractSyntaxTree(
    program(reducedTree)
  ).source
}

module.exports = { transpile }
