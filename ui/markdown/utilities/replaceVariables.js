/**
 * Replace {variableName} placeholders in text with actual values from data
 * @param {string} text - Text containing variable placeholders
 * @param {Object} data - Data object with variable values
 * @returns {string|Array} - Text with variables replaced, or array if mixed content
 */
function replaceVariables(text, data) {
  if (!text || typeof text !== "string") {
    return text
  }

  if (!data || typeof data !== "object") {
    return text
  }

  // Check if text contains any variables
  if (!text.includes("{") || !text.includes("}")) {
    return text
  }

  const result = []
  let i = 0
  let lastIndex = 0

  while (i < text.length) {
    if (text[i] === "\\" && text[i + 1] === "{") {
      // Escaped opening brace
      result.push(text.substring(lastIndex, i))
      result.push("{")
      i += 2
      lastIndex = i
      continue
    }

    if (text[i] === "{") {
      const closeIndex = text.indexOf("}", i + 1)

      if (closeIndex !== -1) {
        // Found a variable placeholder
        const variableName = text.substring(i + 1, closeIndex).trim()

        if (variableName) {
          // Add text before the variable
          if (i > lastIndex) {
            result.push(text.substring(lastIndex, i))
          }

          // Add the variable value
          const value = data[variableName]
          if (value !== undefined && value !== null) {
            result.push(String(value))
          } else {
            // Variable not found, keep the placeholder
            result.push(text.substring(i, closeIndex + 1))
          }

          i = closeIndex + 1
          lastIndex = i
          continue
        }
      }
    }

    i++
  }

  // Add remaining text
  if (lastIndex < text.length) {
    result.push(text.substring(lastIndex))
  }

  // If no substitutions were made, return original text
  if (result.length === 0) {
    return text
  }

  return result.join("")
}

module.exports = { replaceVariables }
