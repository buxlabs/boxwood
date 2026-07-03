/**
 * Resolve a path like "images[0].src" or "user.name" from a data object
 * @param {Object} data - The data object to resolve the path from
 * @param {string} path - The path to resolve (e.g., "images[0].src", "user.name")
 * @returns {*} - The resolved value or undefined
 */
function resolvePath(data, path) {
  // Handle simple variable names (backwards compatibility)
  if (!/[.\[]/.test(path)) {
    return data[path]
  }

  // Split the path into parts, handling both dot notation and bracket notation
  // e.g., "images[0].src" -> ["images", "0", "src"]
  const parts = path
    .replace(/\[(\d+)\]/g, ".$1") // Convert [0] to .0
    .split(".")
    .filter(Boolean)

  let current = data
  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined
    }
    current = current[part]
  }

  return current
}

/**
 * Replace {variableName} placeholders in text with actual values from data
 * Supports:
 * - Simple variables: {name}
 * - Array indexing: {images[0]}
 * - Property access: {user.name}
 * - Combined: {images[0].src}
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
        const variablePath = text.substring(i + 1, closeIndex).trim()

        if (variablePath) {
          // Add text before the variable
          if (i > lastIndex) {
            result.push(text.substring(lastIndex, i))
          }

          // Resolve the variable value (supports paths like "images[0].src")
          const value = resolvePath(data, variablePath)
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

module.exports = { replaceVariables, resolvePath }
