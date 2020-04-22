const Plugin = require('./Plugin')
const { isEmptyObject } = require('pure-conditions')

class RoutesPlugin extends Plugin {
  constructor (options) {
    super()
    const { routes } = options
    this.routes = routes
    this.disabled = isEmptyObject(routes)
  }
  prerun () {
    if (this.disabled) { return }
  }
}

module.exports = RoutesPlugin
