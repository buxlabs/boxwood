// Non-mutating methods that can be called inside a path, e.g. {images.slice(0, 2)}
// Only methods without side effects are allowed - arbitrary code is never evaluated
const SAFE_METHODS = new Set([
  // Arrays and strings
  "slice",
  "at",
  "concat",
  "includes",
  "indexOf",
  "lastIndexOf",
  // Arrays
  "join",
  // Strings
  "toUpperCase",
  "toLowerCase",
  "trim",
  "charAt",
  "substring",
  "split",
  "padStart",
  "padEnd",
  "repeat",
  "replace",
  "replaceAll",
  "startsWith",
  "endsWith",
  // Numbers
  "toFixed",
  // Anything
  "toString",
])

/**
 * Parse a single method argument literal
 * Supports numbers, quoted strings, booleans and null
 * @param {string} raw - The raw argument text
 * @returns {{value: *}|null} - Wrapped value or null if not a valid literal
 */
function parseArgument(raw) {
  const arg = raw.trim()
  if (/^-?\d+(\.\d+)?$/.test(arg)) {
    return { value: Number(arg) }
  }
  if (
    arg.length >= 2 &&
    ((arg.startsWith('"') && arg.endsWith('"')) ||
      (arg.startsWith("'") && arg.endsWith("'")))
  ) {
    return { value: arg.substring(1, arg.length - 1) }
  }
  if (arg === "true") return { value: true }
  if (arg === "false") return { value: false }
  if (arg === "null") return { value: null }
  return null
}

/**
 * Parse a path into segments of property accesses and method calls
 * e.g. "images.slice(0, 2)" -> [{type: "property", name: "images"}, {type: "method", name: "slice", args: [0, 2]}]
 * @param {string} path - The path to parse
 * @returns {Array|null} - Parsed segments or null if the path is malformed
 */
function parsePathSegments(path) {
  const segments = []
  let i = 0

  while (i < path.length) {
    const char = path[i]

    if (char === ".") {
      i++
      continue
    }

    if (char === "[") {
      const close = path.indexOf("]", i)
      if (close === -1) return null
      const index = path.substring(i + 1, close).trim()
      if (!/^\d+$/.test(index)) return null
      segments.push({ type: "property", name: index })
      i = close + 1
      continue
    }

    // Read an identifier up to the next separator
    const start = i
    while (i < path.length && !/[.\[(]/.test(path[i])) {
      i++
    }
    const name = path.substring(start, i).trim()
    if (!name) return null

    if (path[i] === "(") {
      // Method call - collect literal arguments, respecting quoted strings
      i++
      const rawArgs = []
      let current = ""
      let quote = null
      let closed = false
      while (i < path.length) {
        const c = path[i]
        if (quote) {
          current += c
          if (c === quote) quote = null
          i++
          continue
        }
        if (c === '"' || c === "'") {
          quote = c
          current += c
          i++
          continue
        }
        if (c === ",") {
          rawArgs.push(current)
          current = ""
          i++
          continue
        }
        if (c === ")") {
          closed = true
          i++
          break
        }
        current += c
        i++
      }
      if (!closed) return null
      if (current.trim() || rawArgs.length > 0) {
        rawArgs.push(current)
      }

      const args = []
      for (const raw of rawArgs) {
        const parsed = parseArgument(raw)
        if (!parsed) return null
        args.push(parsed.value)
      }
      segments.push({ type: "method", name, args })
    } else {
      segments.push({ type: "property", name })
    }
  }

  return segments
}

/**
 * Resolve a path like "images[0].src", "user.name" or "images.slice(0, 2)" from a data object
 * Method calls are restricted to a whitelist of non-mutating methods with literal arguments
 * @param {Object} data - The data object to resolve the path from
 * @param {string} path - The path to resolve (e.g., "images[0].src", "images.slice(0, 2)")
 * @returns {*} - The resolved value or undefined
 */
function resolvePath(data, path) {
  // Handle null or undefined data
  if (data === null || data === undefined) {
    return undefined
  }

  // Handle simple variable names (backwards compatibility)
  if (!/[.\[(]/.test(path)) {
    return data[path]
  }

  const segments = parsePathSegments(path)
  if (!segments) {
    return undefined
  }

  let current = data
  for (const segment of segments) {
    if (current === null || current === undefined) {
      return undefined
    }
    if (segment.type === "method") {
      if (
        !SAFE_METHODS.has(segment.name) ||
        typeof current[segment.name] !== "function"
      ) {
        return undefined
      }
      try {
        current = current[segment.name](...segment.args)
      } catch (error) {
        return undefined
      }
    } else {
      current = current[segment.name]
    }
  }

  return current
}

/**
 * Check if an expression is an array literal like "[images[0], images[2]]"
 * The opening bracket must be closed at the very end of the expression
 * Pure numeric indexes like "[0]" keep their index-access meaning
 * @param {string} expression - The expression to check
 * @returns {boolean} - True if the expression is an array literal
 */
function isArrayLiteral(expression) {
  if (!expression.startsWith("[") || !expression.endsWith("]")) {
    return false
  }
  const inner = expression.substring(1, expression.length - 1).trim()
  if (/^\d+$/.test(inner)) {
    return false
  }
  let depth = 0
  let quote = null
  for (let i = 0; i < expression.length; i++) {
    const char = expression[i]
    if (quote) {
      if (char === quote) quote = null
      continue
    }
    if (char === '"' || char === "'") {
      quote = char
      continue
    }
    if (char === "[") depth++
    if (char === "]") {
      depth--
      if (depth === 0) {
        return i === expression.length - 1
      }
    }
  }
  return false
}

/**
 * Split the inner part of an array literal into elements on top-level commas
 * Respects nested brackets, parentheses and quoted strings
 * @param {string} inner - The content between the outer brackets
 * @returns {Array<string>} - Raw element expressions
 */
function splitArrayElements(inner) {
  const elements = []
  let current = ""
  let depth = 0
  let quote = null

  for (const char of inner) {
    if (quote) {
      current += char
      if (char === quote) quote = null
      continue
    }
    if (char === '"' || char === "'") {
      quote = char
      current += char
      continue
    }
    if (char === "[" || char === "(") depth++
    if (char === "]" || char === ")") depth--
    if (char === "," && depth === 0) {
      elements.push(current)
      current = ""
      continue
    }
    current += char
  }

  if (current.trim()) {
    elements.push(current)
  }

  return elements
}

/**
 * Split an expression on top-level ?? operators
 * Respects quoted strings, brackets and parentheses
 * @param {string} expression - The expression to split
 * @returns {Array<string>} - Operands (a single element when there is no ??)
 */
function splitNullishCoalescing(expression) {
  const operands = []
  let current = ""
  let depth = 0
  let quote = null
  let i = 0

  while (i < expression.length) {
    const char = expression[i]
    if (quote) {
      current += char
      if (char === quote) quote = null
      i++
      continue
    }
    if (char === '"' || char === "'") {
      quote = char
      current += char
      i++
      continue
    }
    if (char === "[" || char === "(") depth++
    if (char === "]" || char === ")") depth--
    if (depth === 0 && char === "?" && expression[i + 1] === "?") {
      operands.push(current)
      current = ""
      i += 2
      continue
    }
    current += char
    i++
  }

  operands.push(current)
  return operands
}

/**
 * Resolve an expression from a data object
 * Supports everything resolvePath does, plus:
 * - array literals whose elements are paths or literals,
 *   e.g. "[images[0], images[2]]" or "['a', user.name]"
 * - nullish coalescing with JS semantics (fallback only for null/undefined),
 *   e.g. "name ?? 'Guest'" or "nickname ?? name ?? 'Guest'"
 * @param {Object} data - The data object to resolve the expression from
 * @param {string} expression - The expression to resolve
 * @returns {*} - The resolved value or undefined
 */
function resolveExpression(data, expression) {
  const trimmed = expression.trim()

  const operands = splitNullishCoalescing(trimmed)
  if (operands.length > 1) {
    let value
    for (const operand of operands) {
      const raw = operand.trim()
      const literal = parseArgument(raw)
      value = literal ? literal.value : resolveExpression(data, raw)
      if (value !== undefined && value !== null) {
        return value
      }
    }
    return value
  }

  if (isArrayLiteral(trimmed)) {
    const inner = trimmed.substring(1, trimmed.length - 1)
    return splitArrayElements(inner).map((element) => {
      const raw = element.trim()
      const literal = parseArgument(raw)
      if (literal) {
        return literal.value
      }
      return resolveExpression(data, raw)
    })
  }

  return resolvePath(data, trimmed)
}

/**
 * Replace {variableName} placeholders in text with actual values from data
 * Supports:
 * - Simple variables: {name}
 * - Array indexing: {images[0]}
 * - Property access: {user.name}
 * - Combined: {images[0].src}
 * - Fallbacks: {name ?? "Guest"}
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

          // Resolve the expression (supports paths like "images[0].src",
          // safe method calls, array literals and ?? fallbacks)
          const value = resolveExpression(data, variablePath)
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

module.exports = {
  replaceVariables,
  resolvePath,
  resolveExpression,
  // Parsing internals, exported for the Prose validator
  SAFE_METHODS,
  parseArgument,
  parsePathSegments,
  splitNullishCoalescing,
  isArrayLiteral,
  splitArrayElements,
}
