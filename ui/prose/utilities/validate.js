const {
  SAFE_METHODS,
  parseArgument,
  parsePathSegments,
  splitNullishCoalescing,
  isArrayLiteral,
  splitArrayElements,
} = require("../../utilities/replaceVariables")

// Matches the {#each} header accepted by processLoops
const EACH_HEADER_REGEXP =
  /^#each\s+([a-zA-Z0-9_.[\]]+)(?:\s+as\s+([a-zA-Z0-9_]+)(?:\s*,\s*([a-zA-Z0-9_]+))?)?$/

// Matches the comparison conditions accepted by processConditionals
const CONDITION_REGEXP = /^(.+?)\s*(>=|<=|>|<|==|!=)\s*(.+)$/

const INLINE_CODE_REGEXP = /(`+)([^`]+)\1/g
const BRACE_REGEXP = /\{([^{}]*)\}/g
const COMPONENT_TAG_REGEXP = /^<\/?([A-Z][A-Za-z0-9-]*)/
const ATTRIBUTE_EXPRESSION_REGEXP = /=\s*(?:"\{([^}"]*)\}"|'\{([^}']*)\}'|\{([^}]*)\})/g

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
      if (segment.type === "method" && !SAFE_METHODS.has(segment.name)) {
        report(
          line,
          "unsafe-method",
          `Method not allowed: ${segment.name}() - allowed methods: ${[...SAFE_METHODS].join(", ")}`,
        )
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

    for (const operand of splitNullishCoalescing(trimmed)) {
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
          validateExpression(element, line)
        }
        continue
      }
      validatePath(raw, line)
    }
  }

  const validateCondition = (condition, line) => {
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
      validateCondition(content.substring("#elseif".length), line)
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
      stack.push({ type: "if", line })
      validateCondition(content.substring("#if".length), line)
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
    if (componentMatch) {
      // Validate attribute expressions: attr="{expr}" or attr={expr}
      let attrMatch
      while ((attrMatch = ATTRIBUTE_EXPRESSION_REGEXP.exec(trimmed)) !== null) {
        const expression = attrMatch[1] ?? attrMatch[2] ?? attrMatch[3]
        if (expression && expression.trim()) {
          validateExpression(expression, lineNumber)
        }
      }
      continue
    }

    // Braced tags and expressions
    let braceMatch
    while ((braceMatch = BRACE_REGEXP.exec(line)) !== null) {
      // Escaped braces are literal
      if (braceMatch.index > 0 && line[braceMatch.index - 1] === "\\") {
        continue
      }
      const content = braceMatch[1].trim()
      if (!content) continue

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
