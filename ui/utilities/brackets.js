// Find the matching closing bracket, accounting for nested brackets
function findMatchingBracket(text, startPos) {
  let depth = 1
  let i = startPos + 1

  while (i < text.length && depth > 0) {
    if (text[i] === "[" && text[i - 1] !== "\\") {
      depth++
    } else if (text[i] === "]" && text[i - 1] !== "\\") {
      depth--
      if (depth === 0) {
        return i
      }
    }
    i++
  }

  return -1
}

module.exports = { findMatchingBracket }
