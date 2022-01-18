const OPENING_ANGLE_BRACKET = '<'
const CLOSING_ANGLE_BRACKET = '>'

function isOpeningBracket (character) {
  return character === OPENING_ANGLE_BRACKET
}

function isClosingBracket (character) {
  return character === CLOSING_ANGLE_BRACKET
}

// TODO handle script/style tags
// they can have closing/opening brackets
// that do not affect html tags

function verifyBrackets (source) {
  const errors = []
  let bracket = null
  for (const character of source) {
    if (isOpeningBracket(character)) {
      if (isOpeningBracket(bracket)) {
        errors.push({ type: 'CLOSING_ANGLE_BRACKET_MISSING', message: 'closing angle bracket is missing' })
      }
      bracket = OPENING_ANGLE_BRACKET
    } else if (isClosingBracket(character)) {
      if (!isOpeningBracket(bracket)) {
        errors.push({ type: 'OPENING_ANGLE_BRACKET_MISSING', message: 'opening angle bracket is missing' })
      }
      bracket = CLOSING_ANGLE_BRACKET
    }
  }
  return errors
}

module.exports = { verifyBrackets }
