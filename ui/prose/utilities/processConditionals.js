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
 * Also supports negation with ! prefix
 * @param {string} condition - The condition to evaluate
 * @param {Object} data - Data object with variable values
 * @returns {boolean} - Whether the condition is true
 */
function evaluateCondition(condition, data) {
  // Check for negation operator at the start
  let negated = false
  let conditionToEvaluate = condition.trim()

  if (conditionToEvaluate.startsWith("!")) {
    negated = true
    conditionToEvaluate = conditionToEvaluate.substring(1).trim()
  }

  let result

  // Check for comparison operators
  const comparisonMatch = conditionToEvaluate.match(
    /^(.+?)\s*(>=|<=|>|<|==|!=)\s*(.+)$/,
  )

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
        result = leftValue > rightValue
        break
      case "<":
        result = leftValue < rightValue
        break
      case ">=":
        result = leftValue >= rightValue
        break
      case "<=":
        result = leftValue <= rightValue
        break
      case "==":
        result = leftValue == rightValue
        break
      case "!=":
        result = leftValue != rightValue
        break
      default:
        result = false
    }
  } else {
    // No comparison operator, just evaluate truthiness
    const value = resolvePath(data, conditionToEvaluate)
    result = isTruthy(value)
  }

  // Apply negation if present
  return negated ? !result : result
}

/**
 * Process {#if condition}...{/if} blocks in text
 * Supports {#elseif condition} and {#else} blocks
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
    // Remove all {#if}...{/if} blocks, but keep final {#else} content
    let result = text
    // Handle {#if}...{#elseif}...{#else}...{/if}
    result = result.replace(
      /\{#if\s+[^}]+\}[\s\S]*?(?:\{#elseif\s+[^}]+\}[\s\S]*?)*\{#else\}([\s\S]*?)\{\/if\}/g,
      "$1",
    )
    // Handle blocks without {#else}
    result = result.replace(/\{#if\s+[^}]+\}[\s\S]*?\{\/if\}/g, "")
    return result
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
    const firstCondition = ifMatch[1].trim()
    const ifStart = result.indexOf(fullIfTag)
    const contentStart = ifStart + fullIfTag.length

    // Find the matching {/if} and collect all {#elseif} and {#else} blocks
    let depth = 1
    let i = contentStart
    let endIfStart = -1
    const branches = []
    let currentBranchStart = contentStart
    let currentBranchCondition = firstCondition
    let currentBranchType = "if"

    while (i < result.length && depth > 0) {
      if (result.substring(i, i + 4) === "{#if") {
        depth++
        i += 4
      } else if (result.substring(i, i + 5) === "{/if}") {
        depth--
        if (depth === 0) {
          // Save the last branch content
          branches.push({
            type: currentBranchType,
            condition: currentBranchCondition,
            content: result.substring(currentBranchStart, i),
          })
          endIfStart = i
          break
        }
        i += 5
      } else if (result.substring(i, i + 9) === "{#elseif " && depth === 1) {
        // Found {#elseif} at the same depth level
        // Save the current branch
        branches.push({
          type: currentBranchType,
          condition: currentBranchCondition,
          content: result.substring(currentBranchStart, i),
        })

        // Parse the new condition
        const elseifMatch = result.substring(i).match(/^\{#elseif\s+([^}]+)\}/)
        if (elseifMatch) {
          const elseifTag = elseifMatch[0]
          currentBranchCondition = elseifMatch[1].trim()
          currentBranchType = "elseif"
          currentBranchStart = i + elseifTag.length
          i += elseifTag.length
        } else {
          i++
        }
      } else if (result.substring(i, i + 7) === "{#else}" && depth === 1) {
        // Found {#else} at the same depth level
        // Save the current branch
        branches.push({
          type: currentBranchType,
          condition: currentBranchCondition,
          content: result.substring(currentBranchStart, i),
        })

        // Start else branch
        currentBranchType = "else"
        currentBranchCondition = null
        currentBranchStart = i + 7 // +7 for "{#else}"
        i += 7
      } else {
        i++
      }
    }

    // If no matching {/if} found, break to avoid issues
    if (endIfStart === -1) {
      break
    }

    const endIfEnd = endIfStart + 5 // length of "{/if}"

    // Evaluate branches in order and pick the first one that matches
    let selectedContent = ""
    for (const branch of branches) {
      if (branch.type === "else") {
        // Else branch always matches if we get here
        selectedContent = branch.content
        break
      } else if (branch.type === "if" || branch.type === "elseif") {
        // Evaluate the condition
        if (evaluateCondition(branch.condition, data)) {
          selectedContent = branch.content
          break
        }
      }
    }

    // Replace the entire {#if}...{/if} block with the selected content
    result =
      result.substring(0, ifStart) +
      selectedContent +
      result.substring(endIfEnd)
  }

  return result
}

module.exports = { processConditionals, isTruthy, evaluateCondition }
