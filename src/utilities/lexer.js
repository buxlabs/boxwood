'use strict'

const START_TAG = '{'
const END_TAG = '}'

const TEXT = 'text'
const EXPRESSION = 'expression'

module.exports = function lexer (input) {
  const tokens = []
  const length = input.length
  let index = 0
  let character = input[0]
  function advance () {
    index += 1
    character = input[index]
    return character
  }
  function current (tag) {
    return character === tag
  }
  function push (type, value) {
    if (value) tokens.push({ type, value })
  }
  let value = ''
  let type = current(START_TAG) ? EXPRESSION : TEXT
  let depth = 0
  while (index < length) {
    if (current(START_TAG)) { depth += 1 } else if (current(END_TAG)) { depth -= 1 }

    if (current(START_TAG) && depth === 1) {
      push(type, value)
      advance()
      value = ''
      type = EXPRESSION
    } else if (current(END_TAG) && depth === 0) {
      push(type, value)
      advance()
      value = ''
      type = TEXT
    } else {
      value += character
      advance()
    }
  }
  push(type, value)

  return tokens
}
