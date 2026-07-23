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
  // Dates and numbers - locale-aware formatting, e.g. toLocaleDateString('pl-PL')
  "toLocaleDateString",
  "toLocaleTimeString",
  "toLocaleString",
  "toISOString",
  // Anything
  "toString",
])

// Property names that expose the prototype chain - never resolved, so a
// path like "x.constructor.constructor" cannot reach Function or pollute
// prototypes. Blocked for both dot and bracket access, at any depth.
const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"])

// Guard against pathological nesting like "{[[[[...]]]]}" - real expressions
// never nest this deeply, and unbounded recursion would exhaust the stack
const MAX_EXPRESSION_DEPTH = 50

// Real expressions are short (a path, a call, a small array literal); an
// oversized one is an attack or a typo. Cutting it off before the O(n)
// scanners run keeps a malicious "{[[[...]]]}" from allocating megabytes.
const MAX_EXPRESSION_LENGTH = 1000

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
 * e.g. "images.slice(0, limit)" -> [
 *   {type: "property", name: "images"},
 *   {type: "method", name: "slice", args: [
 *     {type: "literal", value: 0},
 *     {type: "path", path: "limit"},
 *   ]},
 * ]
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
      // Method call - collect arguments, respecting quoted strings and
      // nested brackets/parentheses (e.g. "slice(0, items.indexOf('x'))")
      i++
      const rawArgs = []
      let current = ""
      let quote = null
      let closed = false
      let depth = 0
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
        if (c === "(" || c === "[") {
          depth++
          current += c
          i++
          continue
        }
        if (c === "]") {
          depth--
          current += c
          i++
          continue
        }
        if (c === ")") {
          if (depth === 0) {
            closed = true
            i++
            break
          }
          depth--
          current += c
          i++
          continue
        }
        if (c === "," && depth === 0) {
          rawArgs.push(current)
          current = ""
          i++
          continue
        }
        current += c
        i++
      }
      if (!closed) return null
      if (current.trim() || rawArgs.length > 0) {
        rawArgs.push(current)
      }

      // Arguments are literals or data paths, e.g. "slice(0, limit)" -
      // paths are stored unresolved and looked up against data at resolve time
      const args = []
      for (const raw of rawArgs) {
        const parsed = parseArgument(raw)
        if (parsed) {
          args.push({ type: "literal", value: parsed.value })
          continue
        }
        const argPath = raw.trim()
        const argSegments = parsePathSegments(argPath)
        if (!argSegments || argSegments.length === 0) return null
        args.push({ type: "path", path: argPath })
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
 * Method calls are restricted to a whitelist of non-mutating methods
 * Arguments are literals or data paths, e.g. "images.slice(0, limit)"
 * @param {Object} data - The data object to resolve the path from
 * @param {string} path - The path to resolve (e.g., "images[0].src", "images.slice(0, limit)")
 * @returns {*} - The resolved value or undefined
 */
function resolvePath(data, path) {
  // Handle null or undefined data
  if (data === null || data === undefined) {
    return undefined
  }

  // Handle simple variable names (backwards compatibility)
  if (!/[.\[(]/.test(path)) {
    if (FORBIDDEN_KEYS.has(path)) {
      return undefined
    }
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
    // Block prototype-chain access at every hop
    if (FORBIDDEN_KEYS.has(segment.name)) {
      return undefined
    }
    if (segment.type === "method") {
      if (
        !SAFE_METHODS.has(segment.name) ||
        typeof current[segment.name] !== "function"
      ) {
        return undefined
      }
      // Path arguments are full expressions, e.g. "slice(0, n - 1)"
      const args = segment.args.map((arg) =>
        arg.type === "path" ? resolveExpression(data, arg.path) : arg.value,
      )
      try {
        current = current[segment.name](...args)
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
 * Split an expression on a top-level two-character operator (?? or ||)
 * Respects quoted strings, brackets and parentheses
 * @param {string} expression - The expression to split
 * @param {string} char - The operator character, repeated twice ("?" or "|")
 * @returns {Array<string>} - Operands (a single element when there is no operator)
 */
function splitDoubleOperator(expression, char) {
  const operands = []
  let current = ""
  let depth = 0
  let quote = null
  let i = 0

  while (i < expression.length) {
    const c = expression[i]
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
    if (c === "[" || c === "(") depth++
    if (c === "]" || c === ")") depth--
    if (depth === 0 && c === char && expression[i + 1] === char) {
      operands.push(current)
      current = ""
      i += 2
      continue
    }
    current += c
    i++
  }

  operands.push(current)
  return operands
}

/**
 * Split an expression on top-level ?? operators
 * @param {string} expression - The expression to split
 * @returns {Array<string>} - Operands (a single element when there is no ??)
 */
function splitNullishCoalescing(expression) {
  return splitDoubleOperator(expression, "?")
}

/**
 * Split an expression on top-level || operators
 * @param {string} expression - The expression to split
 * @returns {Array<string>} - Operands (a single element when there is no ||)
 */
function splitLogicalOr(expression) {
  return splitDoubleOperator(expression, "|")
}

/**
 * Split an expression on top-level && operators
 * @param {string} expression - The expression to split
 * @returns {Array<string>} - Operands (a single element when there is no &&)
 */
function splitLogicalAnd(expression) {
  return splitDoubleOperator(expression, "&")
}

/**
 * Split an expression on top-level arithmetic operators from the given set
 * Operators must be surrounded by spaces ("i + 1", not "i+1") to stay
 * unambiguous with negative literals and identifiers
 * Respects quoted strings, brackets and parentheses
 * @param {string} expression - The expression to split
 * @param {Array<string>} characters - Operator characters, e.g. ["+", "-"]
 * @returns {{operands: Array<string>, operators: Array<string>}}
 */
function splitArithmetic(expression, characters) {
  const operands = []
  const operators = []
  let current = ""
  let depth = 0
  let quote = null
  let i = 0

  while (i < expression.length) {
    const c = expression[i]
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
    if (c === "[" || c === "(") depth++
    if (c === "]" || c === ")") depth--
    if (
      depth === 0 &&
      characters.includes(c) &&
      expression[i - 1] === " " &&
      expression[i + 1] === " "
    ) {
      operands.push(current)
      operators.push(c)
      current = ""
      i += 2
      continue
    }
    current += c
    i++
  }

  operands.push(current)
  return { operands, operators }
}

/**
 * Apply a single arithmetic operator with JS semantics
 * "+" works for numbers and strings (concatenation), the rest require numbers
 * Nullish operands and NaN results resolve to undefined
 */
function applyArithmetic(left, operator, right) {
  if (
    left === undefined ||
    left === null ||
    right === undefined ||
    right === null
  ) {
    return undefined
  }
  if (operator === "+") {
    const addable = (value) =>
      typeof value === "number" || typeof value === "string"
    if (!addable(left) || !addable(right)) {
      return undefined
    }
    const result = left + right
    return typeof result === "number" && Number.isNaN(result)
      ? undefined
      : result
  }
  if (typeof left !== "number" || typeof right !== "number") {
    return undefined
  }
  let result
  if (operator === "-") {
    result = left - right
  } else if (operator === "*") {
    result = left * right
  } else {
    result = left / right
  }
  return Number.isNaN(result) ? undefined : result
}

/**
 * Resolve an expression from a data object
 * Supports everything resolvePath does, plus:
 * - array literals whose elements are paths or literals,
 *   e.g. "[images[0], images[2]]" or "['a', user.name]"
 * - spread elements inside array literals,
 *   e.g. "[...images.slice(0, 2), ...images.slice(4)]"
 * - nullish coalescing with JS semantics (fallback only for null/undefined),
 *   e.g. "name ?? 'Guest'" or "nickname ?? name ?? 'Guest'"
 * - logical or with JS semantics (fallback for any falsy value),
 *   e.g. "title || 'Untitled'"
 * - logical and with JS semantics (first falsy operand, or the last one),
 *   with JS precedence (&& binds tighter than ||)
 * - arithmetic with space-separated + - * / operators and JS precedence,
 *   e.g. "i + 1", "items.length - 1", "price * quantity"
 * Mixing ?? with || or && in one expression is a syntax error in JS
 * (parentheses are required) - such expressions resolve to undefined
 * @param {Object} data - The data object to resolve the expression from
 * @param {string} expression - The expression to resolve
 * @returns {*} - The resolved value or undefined
 */
function resolveExpression(data, expression, depth = 0) {
  // Bail out on pathological nesting before the stack is exhausted
  if (depth > MAX_EXPRESSION_DEPTH) {
    return undefined
  }
  // Oversized expressions are never legitimate - reject before scanning
  if (expression.length > MAX_EXPRESSION_LENGTH) {
    return undefined
  }
  const trimmed = expression.trim()
  const recurse = (raw) => resolveExpression(data, raw, depth + 1)

  const nullishOperands = splitNullishCoalescing(trimmed)
  const orOperands = splitLogicalOr(trimmed)
  const andOperands = splitLogicalAnd(trimmed)

  // Mixing ?? with || or && without parentheses is invalid, same as in JS
  if (
    nullishOperands.length > 1 &&
    (orOperands.length > 1 || andOperands.length > 1)
  ) {
    return undefined
  }

  if (nullishOperands.length > 1) {
    let value
    for (const operand of nullishOperands) {
      const raw = operand.trim()
      const literal = parseArgument(raw)
      value = literal ? literal.value : recurse(raw)
      if (value !== undefined && value !== null) {
        return value
      }
    }
    return value
  }

  // || first so && binds tighter (JS precedence) - each || operand may
  // contain && which the recursive call resolves
  if (orOperands.length > 1) {
    let value
    for (const operand of orOperands) {
      const raw = operand.trim()
      const literal = parseArgument(raw)
      value = literal ? literal.value : recurse(raw)
      if (value) {
        return value
      }
    }
    return value
  }

  if (andOperands.length > 1) {
    let value
    for (const operand of andOperands) {
      const raw = operand.trim()
      const literal = parseArgument(raw)
      value = literal ? literal.value : recurse(raw)
      if (!value) {
        return value
      }
    }
    return value
  }

  // Arithmetic - operators must be surrounded by spaces
  // Sums split first so * and / bind tighter (their operands resolve
  // through the recursive call), chains evaluate left to right
  const sums = splitArithmetic(trimmed, ["+", "-"])
  const arithmetic =
    sums.operators.length > 0 ? sums : splitArithmetic(trimmed, ["*", "/"])
  if (arithmetic.operators.length > 0) {
    const resolveOperand = (raw) => {
      const operand = raw.trim()
      const literal = parseArgument(operand)
      return literal ? literal.value : recurse(operand)
    }
    let value = resolveOperand(arithmetic.operands[0])
    for (let index = 0; index < arithmetic.operators.length; index++) {
      value = applyArithmetic(
        value,
        arithmetic.operators[index],
        resolveOperand(arithmetic.operands[index + 1]),
      )
      if (value === undefined) {
        return undefined
      }
    }
    return value
  }

  if (isArrayLiteral(trimmed)) {
    const inner = trimmed.substring(1, trimmed.length - 1)
    const result = []
    for (const element of splitArrayElements(inner)) {
      const raw = element.trim()
      if (raw.startsWith("...")) {
        // Spread element - flatten the resolved array into the result,
        // e.g. "[...images.slice(0, 2), ...images.slice(4)]"
        // Nullish values disappear, other non-array values are kept as-is
        const value = recurse(raw.substring(3))
        if (Array.isArray(value)) {
          result.push(...value)
        } else if (value !== undefined && value !== null) {
          result.push(value)
        }
        continue
      }
      const literal = parseArgument(raw)
      result.push(literal ? literal.value : recurse(raw))
    }
    return result
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
  FORBIDDEN_KEYS,
  MAX_EXPRESSION_LENGTH,
  parseArgument,
  parsePathSegments,
  splitNullishCoalescing,
  splitLogicalOr,
  splitLogicalAnd,
  splitArithmetic,
  isArrayLiteral,
  splitArrayElements,
}
