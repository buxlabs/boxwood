const AbstractSyntaxTree = require('abstract-syntax-tree')
const { match } = require('abstract-syntax-tree')
const { dig } = require('pure-utilities/object')
const { parse } = require('path-to-regexp')

function transform (source, routes, errors) {
  const tree = new AbstractSyntaxTree(source)
  tree.replace(node => {
    if (match(node, 'CallExpression[callee.type="MemberExpression"][callee.object.name="routes"][callee.property.name="get"]')) {
      const params = node.arguments
      if (params.length === 0) {
        errors.push({ type: 'ROUTE_INVALID', message: 'routes.get requires a string literal as the first parameter.' })
      } else {
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
        if (params.length === 1) {
          return {
            type: 'Literal',
            value: url
          }
        }
        const quasis = []
        const parts = parse(url)
        // TODO it doesn't handle more complex cases yet
        parts.forEach((part, index) => {
          const last = index === parts.length - 1
          if (typeof part === 'string') {
            const value = part + (last ? '' : '/')
            quasis.push({
              type: 'TemplateElement',
              value: {
                cooked: value,
                raw: value
              },
              tail: last
            })
          }
        })
        if (quasis[quasis.length - 1].tail === false) {
          quasis.push({
            type: 'TemplateElement',
            value: {
              cooked: '',
              raw: ''
            },
            tail: true
          })
        }
        // TODO could be optimized to inline literals
        return {
          type: 'TemplateLiteral',
          quasis,
          expressions: params.slice(1)
        }
      }
    }
  })
  return tree.source
}

module.exports = { transform }
