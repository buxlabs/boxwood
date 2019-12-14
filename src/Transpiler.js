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

const transform = (tokens) => {
  const output = []
  let context = null
  tokens.forEach((token, index) => {
    const [type, value] = token
    if (type === 'tagName') {
      if (value === 'if' || value === 'unless') {
        context = value
      } else if (value === 'elseif' || value === 'else' || value === 'elseunless') {
        if (context === 'if' || context === 'elseif' || context === 'unless') {
          const last = output.pop()
          output.push(['beginEndTag', '</'])
          output.push(['tagName', context])
          output.push(['finishTag', '>'])
          output.push(last)
          context = value
        }
      } else if (value === 'end') {
        if (context === 'if' || context === 'unless' || context === 'elseunless' || context === 'else' || context === 'elseif') {
          tokens[index - 1][0] = 'beginEndTag'
          tokens[index - 1][1] = '</'
          token[1] = context
        }
        context = null
      }
    }
    output.push(token)
  })
  return output
}

const stringify = (tokens) => {
  return tokens.map(([type, value]) => value).join('')
}

class Transpiler {
  transpile (source) {
    const tokens = tokenize(source)
    return stringify(transform(tokens))
  }
}

module.exports = Transpiler
