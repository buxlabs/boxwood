const { resolvePath } = require("./replaceVariables")

/**
 * Check if a value is truthy for conditional rendering
 * @param {*} value - The value to check
 * @returns {boolean} - Whether the value is truthy
 */
function isTruthy(value) {
  // null and undefined are falsy
  if (value === null || value === undefined) {
    return false
  }
  // Empty string is falsy
  if (value === "") {
    return false
  }
  // 0 is falsy
  if (value === 0) {
    return false
  }
  // false is falsy
  if (value === false) {
    return false
  }
  // Empty array is falsy
  if (Array.isArray(value) && value.length === 0) {
    return false
  }
  // Everything else is truthy
  return true
}

/**
 * Evaluate a condition expression
 * Supports: variable, variable > value, variable < value, etc.
 * @param {string} condition - The condition to evaluate
 * @param {Object} data - Data object with variable values
 * @returns {boolean} - Whether the condition is true
 */
function evaluateCondition(condition, data) {
  // Check for comparison operators
  const comparisonMatch = condition.match(/^(.+?)\s*(>=|<=|>|<|==|!=)\s*(.+)$/)

  if (comparisonMatch) {
    const [, leftExpr, operator, rightExpr] = comparisonMatch

    // Resolve left side (variable or path)
    const leftValue = resolvePath(data, leftExpr.trim())

    // Resolve right side (could be a number, string, or variable)
    let rightValue = rightExpr.trim()

    // Try to parse as number
    if (/^-?\d+(\.\d+)?$/.test(rightValue)) {
      rightValue = parseFloat(rightValue)
    }
    // Try to parse as boolean
    else if (rightValue === "true") {
      rightValue = true
    } else if (rightValue === "false") {
      rightValue = false
    }
    // Try to parse as string literal (quoted)
    else if (
      (rightValue.startsWith('"') && rightValue.endsWith('"')) ||
      (rightValue.startsWith("'") && rightValue.endsWith("'"))
    ) {
      rightValue = rightValue.slice(1, -1)
    }
    // Otherwise treat as a variable path
    else {
      rightValue = resolvePath(data, rightValue)
    }

    // Perform comparison
    switch (operator) {
      case ">":
        return leftValue > rightValue
      case "<":
        return leftValue < rightValue
      case ">=":
        return leftValue >= rightValue
      case "<=":
        return leftValue <= rightValue
      case "==":
        return leftValue == rightValue
      case "!=":
        return leftValue != rightValue
      default:
        return false
    }
  }

  // No comparison operator, just evaluate truthiness
  const value = resolvePath(data, condition)
  return isTruthy(value)
}

/**
 * Process {#if condition}...{/if} blocks in text
 * Removes blocks where the condition is falsy
 * @param {string} text - Text containing conditional blocks
 * @param {Object} data - Data object with variable values
 * @returns {string} - Text with conditionals processed
 */
function processConditionals(text, data) {
  if (!text || typeof text !== "string") {
    return text
  }

  // If no data, treat all conditions as falsy
  if (!data || typeof data !== "object") {
    // Remove all {#if}...{/if} blocks
    return text.replace(/\{#if\s+[^}]+\}[\s\S]*?\{\/if\}/g, "")
  }

  let result = text
  let maxIterations = 100 // Prevent infinite loops
  let iterations = 0

  // Process all {#if} blocks (handles nested blocks by processing innermost first)
  while (/{#if\s+[^}]+\}/.test(result) && iterations < maxIterations) {
    iterations++

    // Find the next {#if} block
    const ifMatch = result.match(/\{#if\s+([^}]+)\}/)
    if (!ifMatch) break

    const fullIfTag = ifMatch[0]
    const condition = ifMatch[1].trim()
    const ifStart = result.indexOf(fullIfTag)
    const contentStart = ifStart + fullIfTag.length

    // Find the matching {/if}
    let depth = 1
    let i = contentStart
    let endIfStart = -1

    while (i < result.length && depth > 0) {
      if (result.substring(i, i + 4) === "{#if") {
        depth++
        i += 4
      } else if (result.substring(i, i + 5) === "{/if}") {
        depth--
        if (depth === 0) {
          endIfStart = i
          break
        }
        i += 5
      } else {
        i++
      }
    }

    // If no matching {/if} found, break to avoid issues
    if (endIfStart === -1) {
      break
    }

    const blockContent = result.substring(contentStart, endIfStart)
    const endIfEnd = endIfStart + 5 // length of "{/if}"

    // Evaluate the condition
    const shouldRender = evaluateCondition(condition, data)

    // Replace the entire {#if}...{/if} block
    if (shouldRender) {
      // Keep the content, remove the tags
      result =
        result.substring(0, ifStart) + blockContent + result.substring(endIfEnd)
    } else {
      // Remove the entire block
      result = result.substring(0, ifStart) + result.substring(endIfEnd)
    }
  }

  return result
}

module.exports = { processConditionals, isTruthy, evaluateCondition }
