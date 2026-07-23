const {
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
} = require("../../utilities/replaceVariables")
const { scanUnquotedGt } = require("../../utilities/parseBlock")

// Matches the {#each} header accepted by processLoops
// The array part is any expression, e.g. "posts.slice(0, 3)"
const EACH_HEADER_REGEXP =
  /^#each\s+(.+?)(?:\s+as\s+([a-zA-Z0-9_]+)(?:\s*,\s*([a-zA-Z0-9_]+))?)?$/

// Matches the comparison conditions accepted by processConditionals
const CONDITION_REGEXP = /^(.+?)\s*(===|!==|>=|<=|>|<|==|!=)\s*(.+)$/

const INLINE_CODE_REGEXP = /(`+)([^`]+)\1/g
const BRACE_REGEXP = /\{([^{}]*)\}/g
const COMPONENT_TAG_REGEXP = /^<\/?([A-Z][A-Za-z0-9-]*)/

/**
 * Validate a Prose template and report problems that the renderer
 * would otherwise tolerate silently
 * @param {string} text - The prose template text
 * @param {Object} options - { data, components } - both optional
 *   - data: when provided, unknown top-level variables are reported
 *   - components: map of known components (including builtins)
 * @returns {Array<{line: number, type: string, message: string}>} - Problems found
 */
function validate(text, options = {}) {
  const issues = []

  if (!text || typeof text !== "string") {
    return issues
  }

  const { data, components } = options

  // Track open {#if}/{#each} blocks; each frame: { type, line, vars }
  const stack = []

  const report = (line, type, message) => {
    issues.push({ line, type, message })
  }

  const scopeVariables = () => {
    const vars = new Set()
    for (const frame of stack) {
      if (frame.vars) {
        for (const name of frame.vars) vars.add(name)
      }
    }
    return vars
  }

  const validatePath = (path, line) => {
    const segments = parsePathSegments(path)
    if (!segments || segments.length === 0) {
      report(line, "malformed-expression", `Malformed expression: {${path}}`)
      return
    }
    for (const segment of segments) {
      if (FORBIDDEN_KEYS.has(segment.name)) {
        report(
          line,
          "forbidden-property",
          `Property not allowed: ${segment.name} - prototype access is blocked`,
        )
      }
      if (segment.type === "method") {
        if (!SAFE_METHODS.has(segment.name)) {
          report(
            line,
            "unsafe-method",
            `Method not allowed: ${segment.name}() - allowed methods: ${[...SAFE_METHODS].join(", ")}`,
          )
        }
        // Path arguments are full expressions, e.g. "slice(0, n - 1)"
        for (const arg of segment.args) {
          if (arg.type === "path") {
            validateExpression(arg.path, line)
          }
        }
      }
    }
    const root = segments[0]
    if (
      data &&
      typeof data === "object" &&
      root.type === "property" &&
      !/^\d+$/.test(root.name) &&
      !(root.name in data) &&
      !scopeVariables().has(root.name)
    ) {
      report(line, "unknown-variable", `Unknown variable: ${root.name}`)
    }
  }

  const validateExpression = (expression, line) => {
    const trimmed = expression.trim()
    if (!trimmed) return

    // Oversized expressions are rejected by the resolver too - report and
    // stop before the recursive scanners run on a pathological input
    if (expression.length > MAX_EXPRESSION_LENGTH) {
      report(
        line,
        "malformed-expression",
        `Expression too long (over ${MAX_EXPRESSION_LENGTH} characters)`,
      )
      return
    }

    const nullishOperands = splitNullishCoalescing(trimmed)
    const orOperands = splitLogicalOr(trimmed)
    const andOperands = splitLogicalAnd(trimmed)

    // Mixing ?? with || or && without parentheses is invalid, same as in JS
    if (
      nullishOperands.length > 1 &&
      (orOperands.length > 1 || andOperands.length > 1)
    ) {
      report(
        line,
        "malformed-expression",
        `Cannot mix ?? with || or && in one expression: {${trimmed}}`,
      )
      return
    }

    // || first so && binds tighter (JS precedence) - operands of || may
    // contain && and recurse through validateExpression
    const operands =
      orOperands.length > 1
        ? orOperands
        : andOperands.length > 1
          ? andOperands
          : nullishOperands

    if (operands.length > 1) {
      for (const operand of operands) {
        const raw = operand.trim()
        if (!raw) {
          report(
            line,
            "malformed-expression",
            `Malformed expression: {${trimmed}}`,
          )
          continue
        }
        validateExpression(raw, line)
      }
      return
    }

    // Arithmetic operands validate recursively, e.g. {i + 1}
    const sums = splitArithmetic(trimmed, ["+", "-"])
    const arithmetic =
      sums.operators.length > 0 ? sums : splitArithmetic(trimmed, ["*", "/"])
    if (arithmetic.operators.length > 0) {
      for (const operand of arithmetic.operands) {
        const raw = operand.trim()
        if (!raw) {
          report(
            line,
            "malformed-expression",
            `Malformed expression: {${trimmed}}`,
          )
          continue
        }
        validateExpression(raw, line)
      }
      return
    }

    for (const operand of operands) {
      const raw = operand.trim()
      if (!raw) {
        report(
          line,
          "malformed-expression",
          `Malformed expression: {${trimmed}}`,
        )
        continue
      }
      if (parseArgument(raw)) {
        continue
      }
      if (isArrayLiteral(raw)) {
        for (const element of splitArrayElements(raw.substring(1, raw.length - 1))) {
          // Spread elements validate the spread expression itself
          const rawElement = element.trim()
          validateExpression(
            rawElement.startsWith("...") ? rawElement.substring(3) : rawElement,
            line,
          )
        }
        continue
      }
      validatePath(raw, line)
    }
  }

  const validateCondition = (condition, line) => {
    // Logical operators - validate each operand on its own
    const orOperands = splitLogicalOr(condition)
    const operands =
      orOperands.length > 1 ? orOperands : splitLogicalAnd(condition)
    if (operands.length > 1) {
      for (const operand of operands) {
        if (!operand.trim()) {
          report(
            line,
            "malformed-expression",
            `Malformed condition: {#if ${condition.trim()}}`,
          )
          continue
        }
        validateCondition(operand, line)
      }
      return
    }

    let expr = condition.trim()
    if (expr.startsWith("!")) {
      expr = expr.substring(1).trim()
    }
    const match = expr.match(CONDITION_REGEXP)
    if (match) {
      const [, left, , right] = match
      validateExpression(left, line)
      const rawRight = right.trim()
      if (
        !parseArgument(rawRight) &&
        rawRight !== "true" &&
        rawRight !== "false" &&
        rawRight !== "null"
      ) {
        validateExpression(rawRight, line)
      }
    } else {
      validateExpression(expr, line)
    }
  }

  const handleControlTag = (content, line) => {
    if (content.startsWith("#each")) {
      const header = content.match(EACH_HEADER_REGEXP)
      if (!header) {
        report(line, "malformed-block", `Malformed block: {${content}}`)
        // Push anyway so the matching {/each} does not report a false error
        stack.push({ type: "each", line, vars: ["item"] })
        return
      }
      const [, arrayPath, itemName, indexName] = header
      const vars = [itemName || "item"]
      if (indexName) vars.push(indexName)
      validateExpression(arrayPath, line)
      stack.push({ type: "each", line, vars })
      return
    }

    if (content.startsWith("#elseif")) {
      const top = stack[stack.length - 1]
      if (!top || top.type !== "if") {
        report(
          line,
          "unmatched-block",
          "{#elseif} without a matching {#if}",
        )
      }
      const condition = content.substring("#elseif".length)
      if (!condition.trim()) {
        report(line, "malformed-block", "Empty condition: {#elseif}")
        return
      }
      validateCondition(condition, line)
      return
    }

    if (content === "#else") {
      if (stack.length === 0) {
        report(
          line,
          "unmatched-block",
          "{#else} without a matching {#if} or {#each}",
        )
      }
      return
    }

    if (content.startsWith("#if")) {
      // Push before validating so a matching {/if} does not report an error
      stack.push({ type: "if", line })
      const condition = content.substring("#if".length)
      if (!condition.trim()) {
        // The renderer leaves {#if } blocks as literal text
        report(line, "malformed-block", "Empty condition: {#if}")
        return
      }
      validateCondition(condition, line)
      return
    }

    if (content === "/each" || content === "/if") {
      const expected = content === "/each" ? "each" : "if"
      const top = stack[stack.length - 1]
      if (!top) {
        report(line, "unmatched-block", `{${content}} without a matching {#${expected}}`)
      } else if (top.type !== expected) {
        report(
          line,
          "unmatched-block",
          `{${content}} closes {#${top.type}} opened on line ${top.line}`,
        )
        stack.pop()
      } else {
        stack.pop()
      }
      return
    }

    report(line, "malformed-block", `Unknown block tag: {${content}}`)
  }

  const lines = text.split("\n")
  let inFence = false
  let fenceLine = 0
  let inComment = false
  let commentLine = 0

  for (let i = 0; i < lines.length; i++) {
    const lineNumber = i + 1
    let line = lines[i]

    // Fenced code blocks are literal content - skip them entirely
    if (line.trim().startsWith("```")) {
      inFence = !inFence
      if (inFence) fenceLine = lineNumber
      continue
    }
    if (inFence) continue

    // Author comments - skip their content, track unclosed openings
    if (inComment) {
      const close = line.indexOf("--}")
      if (close === -1) continue
      line = line.substring(close + 3)
      inComment = false
    }
    while (line.includes("{!--")) {
      const open = line.indexOf("{!--")
      const close = line.indexOf("--}", open + 4)
      if (close === -1) {
        line = line.substring(0, open)
        inComment = true
        commentLine = lineNumber
        break
      }
      line = line.substring(0, open) + line.substring(close + 3)
    }

    // Inline code spans are literal content
    line = line.replace(INLINE_CODE_REGEXP, "")

    // Component tags
    const trimmed = line.trim()
    const componentMatch = trimmed.match(COMPONENT_TAG_REGEXP)
    if (componentMatch && components && typeof components === "object") {
      const tagName = componentMatch[1]
      if (!components[tagName]) {
        report(
          lineNumber,
          "unknown-component",
          `Unknown component: <${tagName}>`,
        )
      }
    }
    // Multi-line component tags - join the attribute lines so expressions
    // spanning lines (e.g. multi-line array literals) are validated as one
    // The tag ends at the first > outside quoted attribute values
    const gtState = { quote: null }
    if (componentMatch && !scanUnquotedGt(line, gtState)) {
      const parts = [line]
      let j = i + 1
      // A blank line ends the markdown block - stop joining there
      while (
        j < lines.length &&
        lines[j].trim() &&
        !scanUnquotedGt(lines[j], gtState)
      ) {
        parts.push(lines[j])
        j++
      }
      if (j < lines.length && lines[j].trim()) {
        parts.push(lines[j])
        line = parts.join("\n")
        i = j
      }
    }
    // Braced tags and expressions - on component lines this also covers
    // attribute expressions, both whole-value ({expr}) and partial (/p/{id})
    let braceMatch
    while ((braceMatch = BRACE_REGEXP.exec(line)) !== null) {
      // Escaped braces are literal
      if (braceMatch.index > 0 && line[braceMatch.index - 1] === "\\") {
        continue
      }
      const content = braceMatch[1].trim()
      if (!content) {
        // A forgotten value - the renderer keeps {} as literal text,
        // and an attribute value "{}" is passed through as a string
        report(
          lineNumber,
          "malformed-expression",
          "Empty expression: {} - escape with \\{ for literal braces",
        )
        continue
      }

      if (content.startsWith("#") || content.startsWith("/")) {
        handleControlTag(content, lineNumber)
      } else {
        validateExpression(content, lineNumber)
      }
    }
  }

  if (inFence) {
    report(fenceLine, "unclosed-code-block", "Unclosed code block (```)")
  }
  if (inComment) {
    report(commentLine, "unclosed-comment", "Unclosed comment ({!-- without --})")
  }

  for (const frame of stack) {
    report(
      frame.line,
      "unclosed-block",
      `Unclosed {#${frame.type}} opened on line ${frame.line}`,
    )
  }

  return issues.sort((a, b) => a.line - b.line)
}

module.exports = { validate }
