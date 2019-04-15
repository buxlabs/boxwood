const parse = require('./html/parse')

class Parser {
  parse (source) {
    return parse(source)
  }
}

module.exports = Parser
