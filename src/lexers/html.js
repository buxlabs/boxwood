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
  return reduce(normalize(tokens))
}

const normalize = (tokens) => {
  for (let i = 0, ilen = tokens.length; i < ilen; i += 1) {
    const current = tokens[i]
    if (current[0] === 'endTagPrefix') {
      const previous = tokens[i - 1]
      const next = tokens[i + 1]
      if (previous && next && previous[0] === 'rawtext' && next[0] === 'rawtext') {
        current[0] = 'rawtext'
      }
    }
  }
  return tokens
}

const reduce = (tokens) => {
  const newTokens = []
  for (let i = 0, ilen = tokens.length; i < ilen; i += 1) {
    const current = tokens[i]
    if (current[0] === 'rawtext') {
      let text = current[1]
      let next = tokens[i + 1]
      while (next && next[0] === 'rawtext') {
        i++
        text += next[1]
        next = tokens[i + 1]
      }
      newTokens.push(['rawtext', text])
    } else {
      newTokens.push(tokens[i])
    }
  }
  return newTokens
}

module.exports = tokenize
