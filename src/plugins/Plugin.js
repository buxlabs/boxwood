'use strict'

class Plugin {
  constructor () {
    this.depth = 0
  }

  prerun (options) {}
  run (options) {}
  postrun (options) {}

  beforeprerun (options) {}
  afterprerun (options) {}

  beforerun (options) {}
  afterrun (options) {}

  beforepostrun (options) {}
  afterpostrun (options) {}
}

module.exports = Plugin
