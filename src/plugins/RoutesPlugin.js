const Plugin = require('./Plugin')
const { isEmptyObject } = require('pure-conditions')
const { transform } = require('../utilities/routes')

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
        fragment.children[0].content = transform(content, this.routes)
      }
      fragment.attributes = fragment.attributes.filter(attribute => attribute.key !== 'routes')
    }
  }
}

module.exports = RoutesPlugin
