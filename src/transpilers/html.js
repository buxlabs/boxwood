const { parse } = require('../utilities/html')
const AbstractSyntaxTree = require('abstract-syntax-tree')

const program = (body) => {
  // TODO add `AbstractSyntaxTree.program`
  // TODO improve `AbstractSyntaxTree.template() to support import/export`
  return {
    type: 'Program',
    sourceType: 'module',
    body: [
      {
        type: 'ImportDeclaration',
        specifiers: [
          {
            type: 'ImportSpecifier',
            local: {
              type: 'Identifier',
              name: 'tag'
            },
            imported: {
              type: 'Identifier',
              name: 'tag'
            }
          }
        ],
        source: {
          type: 'Literal',
          value: 'boxwood'
        }
      },
      {
        type: 'ExportDefaultDeclaration',
        declaration: {
          type: 'FunctionDeclaration',
          id: null,
          params: [],
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'ReturnStatement',
                argument: body
              }
            ]
          },
          async: false,
          generator: false
        }
      }
    ]
  }
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
  return new AbstractSyntaxTree(
    program(
      reduce(tree[0])
    )
  ).source
}

module.exports = { transpile }
