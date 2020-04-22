const Plugin = require('./Plugin')
const { isEmptyObject } = require('pure-conditions')
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
      if (content.includes('route(')) {
        const tree = new AbstractSyntaxTree(content)
        tree.replace(node => {
          if (node.type === 'CallExpression' && node.callee && node.callee.type === 'Identifier' && node.callee.name === 'route') {
            const params = node.arguments
            if (params.length === 0) {
              // errors.push({ ... })
            } else if (params.length === 1) {
              return {
                type: 'Literal',
                value: '/rest/users'
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
