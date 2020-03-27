'use strict'

const curlyTagReduction = require('./curlyTagReduction')

class Component {
  constructor (source, variables) {
    this.source = source
    this.variables = variables
  }

  optimize () {
    this.source = curlyTagReduction(this.source, this.variables)
  }
}

module.exports = Component
