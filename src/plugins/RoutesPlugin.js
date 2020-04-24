const Plugin = require('./Plugin')
const { isEmptyObject } = require('pure-conditions')
const { transform } = require('../utilities/routes')

class RoutesPlugin extends Plugin {
  constructor (options, errors) {
    super()
    const { routes } = options
    this.routes = routes
    this.errors = errors
    this.disabled = isEmptyObject(routes)
  }

  prerun ({ tag, keys, fragment }) {
    if (tag === 'script' && keys.includes('routes')) {
      if (this.disabled) {
        return this.errors.push({ type: 'EMPTY_ROUTES', message: 'You need to set up routes in compiler options.' })
      }
      const { content } = fragment.children[0]
      // TODO implement routes.has(, routes.each(
      if (content.includes('routes.get(')) {
        fragment.children[0].content = transform(content, this.routes, this.errors)
      }
      fragment.attributes = fragment.attributes.filter(attribute => attribute.key !== 'routes')
    }
  }
}

module.exports = RoutesPlugin
