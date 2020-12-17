'use strict'

const AbstractSyntaxTree = require('abstract-syntax-tree')
const { parse } = require('../utilities/html')

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
      elements: children.map(childNode => {
        return reduce(childNode)
      })
    })
  }
  function mapIfStatement (htmlNode) {
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
    const body = htmlNode.children.map(reduce)
    const argument = body.pop()
    body.push(new ReturnStatement({ argument }))
    return new IfStatement({
      test: mapAttributesToTest(htmlNode),
      consequent: new BlockStatement({ body })
    })
  }

  if (htmlNode.type === 'element' && htmlNode.tagName === 'div') {
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
  } else if (htmlNode.type === 'element' && htmlNode.tagName === 'if') {
    const [node] = AbstractSyntaxTree.template(`
      (function () {
        <%= body %>
      })()
    `, { body: mapIfStatement(htmlNode) })
    return node
  } else if (htmlNode.type === 'text') {
    const { content } = htmlNode
    return new Literal({ value: content })
  }
}

function transpile (source, options) {
  const tree = parse(source)
  const reducedTree = tree.length === 1
    ? reduce(tree[0])
    : new ArrayExpression({ elements: tree.map(reduce) })
  return new AbstractSyntaxTree(
    program(reducedTree)
  ).source
}

module.exports = { transpile }
