'use strict'

const { parse } = require('./utilities/html')

class Parser {
  parse (source) {
    return parse(source)
  }
}

module.exports = Parser
