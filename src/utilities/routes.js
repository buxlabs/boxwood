const AbstractSyntaxTree = require('abstract-syntax-tree')
const { dig } = require('pure-utilities/object')

function transform (source, routes, errors) {
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
        errors.push({ type: 'ROUTE_INVALID', message: 'routes.get requires a string literal as the first parameter.' })
      } else if (params.length === 1) {
        const param = params[0]
        if (param.type !== 'Literal' || typeof param.value !== 'string') {
          errors.push({ type: 'ROUTE_INVALID', message: 'routes.get requires a string literal as the first parameter.' })
          return node
        }
        const url = dig(routes, param.value)
        if (!url) {
          errors.push({ type: 'ROUTE_MISSING', message: `routes.get could not find the '${param.value}' route.` })
          return node
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
