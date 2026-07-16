// Code is literal content - templating (loops, conditionals, interpolation)
// must never run inside fenced code blocks or inline code spans.
// maskCodeSegments swaps code content for opaque tokens before the templating
// passes run, and restoreCodeSegments swaps the original content back into
// the final node tree.

// Global counter so tokens never collide across nested Prose calls
// (a component's children are rendered by a recursive Prose invocation)
let tokenId = 0

// Tokens are wrapped in NUL characters, which cannot appear in typed content
const TOKEN_PREFIX = "\u0000code:"
const TOKEN_SUFFIX = "\u0000"
const TOKEN_REGEXP = /\u0000code:\d+\u0000/g

// Backslash-escaped backticks (\`) are literal text, not code delimiters
const INLINE_CODE_REGEXP = /(?<!\\)(`+)([^`]+)\1/g

/**
 * Replace the content of fenced code blocks and inline code spans with
 * opaque tokens so templating passes leave it untouched
 * Fence delimiters and backticks stay in place so markdown parsing still
 * recognizes the code structure
 * @param {string} text - The raw prose text
 * @returns {{text: string, tokens: Map<string, string>}} - Masked text and token map
 */
function maskCodeSegments(text) {
  const tokens = new Map()

  if (!text || typeof text !== "string") {
    return { text, tokens }
  }

  const mask = (content) => {
    const token = `${TOKEN_PREFIX}${tokenId++}${TOKEN_SUFFIX}`
    tokens.set(token, content)
    return token
  }

  const lines = text.split("\n")
  const result = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.trim().startsWith("```")) {
      // Fenced code block - mask everything until the closing fence
      result.push(line)
      i++
      const codeLines = []
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i])
        i++
      }
      if (codeLines.length > 0) {
        result.push(mask(codeLines.join("\n")))
      }
      if (i < lines.length) {
        result.push(lines[i]) // closing fence
        i++
      }
      continue
    }

    // Inline code spans - mask the content between backticks
    result.push(
      line.replace(
        INLINE_CODE_REGEXP,
        (match, ticks, content) => `${ticks}${mask(content)}${ticks}`,
      ),
    )
    i++
  }

  return { text: result.join("\n"), tokens }
}

/**
 * Restore masked code content in the final node tree
 * Walks strings, arrays and node objects (children and attributes)
 * @param {*} node - A node tree, array, string or any other value
 * @param {Map<string, string>} tokens - Token map from maskCodeSegments
 * @returns {*} - The tree with original code content restored
 */
function restoreCodeSegments(node, tokens) {
  if (!tokens || tokens.size === 0) {
    return node
  }

  if (typeof node === "string") {
    return node.replace(TOKEN_REGEXP, (token) =>
      tokens.has(token) ? tokens.get(token) : token,
    )
  }

  if (Array.isArray(node)) {
    return node.map((child) => restoreCodeSegments(child, tokens))
  }

  if (node && typeof node === "object") {
    for (const key of Object.keys(node)) {
      node[key] = restoreCodeSegments(node[key], tokens)
    }
    return node
  }

  return node
}

module.exports = { maskCodeSegments, restoreCodeSegments }
