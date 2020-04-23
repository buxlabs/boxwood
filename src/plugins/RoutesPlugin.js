const Plugin = require('./Plugin')
const { isEmptyObject } = require('pure-conditions')
const { dig } = require('pure-utilities/object')
const AbstractSyntaxTree = require('abstract-syntax-tree')

class RoutesPlugin extends Plugin {
  constructor (options) {
    super()
    const { routes } = options
    this.routes = routes
    this.disabled = isEmptyObject(routes)
  }

  prerun ({ tag, keys, fragment }) {
    if (this.disabled) { return }
    if (tag === 'script' && keys.includes('routes')) {
      const { content } = fragment.children[0]
      // TODO implement routes.has(, routes.each(
      if (content.includes('routes.get(')) {
        const tree = new AbstractSyntaxTree(content)
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
              const url = dig(this.routes, param.value)
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
        fragment.children[0].content = tree.source
      }
      fragment.attributes = fragment.attributes.filter(attribute => attribute.key !== 'routes')
    }
  }
}

module.exports = RoutesPlugin
