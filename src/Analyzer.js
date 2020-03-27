'use strict'

const { OBJECT_VARIABLE, ESCAPE_VARIABLE } = require('./utilities/enum')

class Analyzer {
  analyze (tree) {
    const params = this.deduceParams(tree)
    return { params }
  }

  deduceParams (tree) {
    // could do it more effectively by checking if given param was used at least once
    // instead of querying here
    if (tree.has(`Identifier[name="${ESCAPE_VARIABLE}"]`)) {
      return [OBJECT_VARIABLE, ESCAPE_VARIABLE].join(', ')
    } else if (tree.has(`Identifier[name="${OBJECT_VARIABLE}"]`)) {
      return OBJECT_VARIABLE
    } else {
      return ''
    }
  }
}

module.exports = Analyzer
