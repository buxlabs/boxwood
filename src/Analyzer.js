const { OBJECT_VARIABLE, ESCAPE_VARIABLE } = require('./enum')

class Analyzer {
  constructor (program) {
    this.program = program
  }

  params () {
    // could do it more effectively by checking if given param was used at least once
    // instead of querying here
    if (this.program.has(`Identifier[name="${ESCAPE_VARIABLE}"]`)) {
      return [OBJECT_VARIABLE, ESCAPE_VARIABLE].join(', ')
    } else if (this.program.has(`Identifier[name="${OBJECT_VARIABLE}"]`)) {
      return OBJECT_VARIABLE
    } else {
      return ''
    }
  }
}

module.exports = Analyzer
