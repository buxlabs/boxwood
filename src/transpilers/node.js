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

let FOR_LOOP_INDEX = 0

function mapForStatement (htmlNode, parent, index) {
  FOR_LOOP_INDEX++
  const [node] = AbstractSyntaxTree.template(`
    (function () {
      var __output__ = [];
      for (var <%= index %> = 0, <%= length %> = <%= array %>.length; <%= index %> < <%= length %>; <%= index %>++) {
        var <%= item %> = <%= array %>[<%= index %>];
        __output__.push(%= children %);
      }
      return __output__;
    })();
  `, {
    index: new Identifier(`__i${FOR_LOOP_INDEX}__`),
    length: new Identifier(`__ilen${FOR_LOOP_INDEX}__`),
    item: new Identifier(htmlNode.attributes[0].key),
    // TODO we should not mark params which were created on the fly, e.g. for nested loops
    array: new Identifier({ name: htmlNode.attributes[2].key, parameter: true }),
    children: htmlNode.children.map((child, index) =>
      transpileNode({ node: child, parent: htmlNode, index: index })
    )
  })
  return node.expression
}

function transpileNode ({ node: htmlNode, parent, index }) {
  function mapAttributes (attributes) {
    return attributes.length > 0 && new ObjectExpression({
      properties: attributes.map(attribute => {
        return new Property({
          key: new Identifier(attribute.key),
          value: new Literal(attribute.value),
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
          return new Literal(true)
        } else if (attributes[0].key === 'false') {
          return new Literal(false)
        } else {
          return new Identifier(attributes[0].key)
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
  } else if (htmlNode.type === 'element' && htmlNode.tagName === 'for') {
    return mapForStatement(htmlNode, parent, index)
  } else if (htmlNode.type === 'element') {
    if (htmlNode.tagName === 'import') { return tags.import(htmlNode) }
    if (htmlNode.tagName === '!doctype') { return tags.doctype() }
    if (htmlNode.tagName === 'partial') { return tags.partial(htmlNode) }
    const { tagName, attributes, children } = htmlNode
    const node = new CallExpression({
      callee: new Identifier('tag'),
      arguments: [
        new Literal(tagName),
        mapAttributes(attributes),
        mapChildren(children)
      ].filter(Boolean)
    })
    return node
  } else if (htmlNode.type === 'text') {
    const { content } = htmlNode
    return transpileExpression(content)
  } else if (htmlNode.type === 'comment') {
    return new Literal('')
  }
}

module.exports = { transpileNode }
