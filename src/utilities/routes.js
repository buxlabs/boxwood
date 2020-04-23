const AbstractSyntaxTree = require('abstract-syntax-tree')
const { dig } = require('pure-utilities/object')

function transform (source, routes) {
  const tree = new AbstractSyntaxTree(source)
  tree.replace(node => {
    if (node.type === 'CallExpression' &&
      node.callee &&
      node.callee.type === 'MemberExpression' &&
      node.callee.object.type === 'Identifier' &&
      node.callee.object.name === 'routes' &&
      node.callee.property.type === 'Identifier' &&
      node.callee.property.name === 'get') {
      const params = node.arguments
      if (params.length === 0) {
        // errors.push({ ... })
      } else if (params.length === 1) {
        const param = params[0]
        if (!param) {
          // errors.push({ ... })
          // return
        } else if (param.type !== 'Literal') {
          // errors.push({ ... })
          // return
        } else if (typeof param.value !== 'string') {
          // errors.push({ ... })
          // return
        }
        const url = dig(routes, param.value)
        if (!url) {
          // errors.push({ ... })
          // return
        }
        return {
          type: 'Literal',
          value: url
        }
      } else if (params.length > 1) {
        // '/foo/:id'.replace(':id', id) <-- verbose, but works everywhere
        // or
        // `/foo/${id}` <-- less verbose, but only in envs that support template literals
      }
    }
  })
  return tree.source
}

module.exports = { transform }
