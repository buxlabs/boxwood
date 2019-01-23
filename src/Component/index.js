const curlyTagReduction = require('./curlyTagReduction')
const htmlTagRemoval = require('./htmlTagRemoval')

class Component {
  constructor (source, variables) {
    this.source = source
    this.variables = variables
  }

  optimize () {
    this.source = curlyTagReduction(this.source, this.variables)
    this.source = htmlTagRemoval(this.source, this.variables)
  }
}

module.exports = Component
