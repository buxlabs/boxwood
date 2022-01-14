const Lexer = require('html-lexer')

const tokenize = (source) => {
  const tokens = []
  const delegate = {
    write: (token) => tokens.push(token),
    end: () => null
  }
  const lexer = new Lexer(delegate)
  lexer.write(source)
  lexer.end()
  return tokens
}

module.exports = tokenize
