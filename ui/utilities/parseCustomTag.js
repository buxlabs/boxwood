const {
  resolveExpression,
  replaceVariables,
} = require("./replaceVariables")

/**
 * Find the first > that is not inside a quoted attribute value
 * @param {string} text - The text to scan
 * @param {number} from - Index to start scanning at
 * @returns {number} - Index of the unquoted > or -1
 */
function findUnquotedGt(text, from) {
  let quote = null
  for (let i = from; i < text.length; i++) {
    const char = text[i]
    if (quote) {
      if (char === quote) quote = null
      continue
    }
    if (char === '"' || char === "'") {
      quote = char
      continue
    }
    if (char === ">") return i
  }
  return -1
}

/**
 * Parse a custom component tag from markdown
 * Supports both <Component attr="value"> and <Component attr={variable}>
 * Attribute values may contain > when quoted, e.g. title="5 > 3",
 * and may span multiple lines (the line then contains newlines)
 * @param {string} line - The line to parse
 * @param {Object} customComponents - Map of component names to functions
 * @returns {Object|null} - Parsed tag info or null if not a custom tag
 */
function parseCustomTag(line, customComponents) {
  if (!customComponents || typeof customComponents !== "object") {
    return null
  }

  const trimmed = line.trim()

  // Closing tag: </ComponentName>
  const closeTagMatch = trimmed.match(/^<\/([A-Za-z][A-Za-z0-9-]*)>\s*$/)
  if (closeTagMatch) {
    const [, tagName] = closeTagMatch
    const component = customComponents[tagName]
    if (component) {
      return {
        type: "custom-component-close",
        tagName,
        component,
      }
    }
    return null
  }

  // Tag name followed by whitespace, / or >
  const nameMatch = trimmed.match(/^<([A-Za-z][A-Za-z0-9-]*)(?=[\s/>])/)
  if (!nameMatch) {
    return null
  }
  const tagName = nameMatch[1]
  const component = customComponents[tagName]
  if (!component) {
    return null
  }

  const gt = findUnquotedGt(trimmed, nameMatch[0].length)
  if (gt === -1) {
    return null
  }

  // Self-closing when / directly precedes the > (whitespace allowed between)
  let attributesEnd = gt
  let selfClosing = false
  let before = gt - 1
  while (before > 0 && /\s/.test(trimmed[before])) {
    before--
  }
  if (trimmed[before] === "/") {
    selfClosing = true
    attributesEnd = before
  }

  const attributesStr = trimmed.substring(nameMatch[0].length, attributesEnd)
  const after = trimmed.substring(gt + 1)

  if (selfClosing) {
    if (after.trim() !== "") {
      return null
    }
    return {
      type: "custom-component",
      tagName,
      component,
      attributes: parseAttributes(attributesStr),
      selfClosing: true,
    }
  }

  if (after.trim() === "") {
    return {
      type: "custom-component-open",
      tagName,
      component,
      attributes: parseAttributes(attributesStr),
      selfClosing: false,
    }
  }

  // Single-line tag with content: <tag ...>content</tag>
  const closeToken = `</${tagName}>`
  const content = after.replace(/\s+$/, "")
  if (content.endsWith(closeToken)) {
    const inner = content.substring(0, content.length - closeToken.length)
    if (inner) {
      return {
        type: "custom-component-single-line",
        tagName,
        component,
        attributes: parseAttributes(attributesStr),
        content: inner,
        selfClosing: false,
      }
    }
  }

  return null
}

/**
 * Parse attributes from a tag string
 * Supports: attr="value", attr='value', attr={variable}, attr
 * @param {string} attributesStr - The attributes string
 * @returns {Object} - Parsed attributes
 */
function parseAttributes(attributesStr) {
  const attributes = {}
  if (!attributesStr || !attributesStr.trim()) {
    return attributes
  }

  const str = attributesStr.trim()
  let i = 0

  while (i < str.length) {
    // Skip whitespace
    while (i < str.length && /\s/.test(str[i])) {
      i++
    }

    if (i >= str.length) break

    // Parse attribute name
    let nameStart = i
    while (i < str.length && /[a-zA-Z0-9-_:]/.test(str[i])) {
      i++
    }

    const name = str.substring(nameStart, i)
    if (!name) break

    // Skip whitespace after name
    while (i < str.length && /\s/.test(str[i])) {
      i++
    }

    // Check for =
    if (i >= str.length || str[i] !== "=") {
      // Boolean attribute
      attributes[name] = true
      continue
    }

    i++ // Skip =

    // Skip whitespace after =
    while (i < str.length && /\s/.test(str[i])) {
      i++
    }

    if (i >= str.length) break

    // Parse value
    const quote = str[i]

    if (quote === '"' || quote === "'") {
      // Quoted string
      i++ // Skip opening quote
      let value = ""
      while (i < str.length && str[i] !== quote) {
        if (str[i] === "\\" && i + 1 < str.length) {
          // Escaped character - add the next character literally
          value += str[i + 1]
          i += 2
        } else {
          value += str[i]
          i++
        }
      }
      
      // Whole-value variable reference: "{variable}" - resolves to the raw
      // value (array, object, number), not a string
      const inner = value.substring(1, value.length - 1)
      if (
        value.startsWith("{") &&
        value.endsWith("}") &&
        inner.trim() &&
        !inner.includes("{") &&
        !inner.includes("}")
      ) {
        attributes[name] = { __variable: inner.trim() }
      } else if (/\{[^{}]+\}/.test(value)) {
        // Partial interpolation: "/products/{id}" or "Photo of {name}"
        attributes[name] = { __interpolate: value }
      } else {
        attributes[name] = value
      }

      if (i < str.length) i++ // Skip closing quote
    } else if (str[i] === "{") {
      // Variable reference
      i++ // Skip {
      const valueStart = i
      while (i < str.length && str[i] !== "}") {
        i++
      }
      const variableName = str.substring(valueStart, i).trim()
      attributes[name] = { __variable: variableName }
      if (i < str.length) i++ // Skip }
    } else {
      // Unquoted value (until space or end)
      const valueStart = i
      while (i < str.length && !/\s/.test(str[i])) {
        i++
      }
      const value = str.substring(valueStart, i)
      attributes[name] = value
    }
  }

  return attributes
}

/**
 * Resolve attributes by replacing variable references with actual values
 * @param {Object} attributes - Attributes with possible variable references
 * @param {Object} data - Data object containing variable values
 * @returns {Object} - Resolved attributes
 */
function resolveAttributes(attributes, data) {
  if (!attributes || typeof attributes !== "object") {
    return {}
  }

  const resolved = {}
  for (const [key, value] of Object.entries(attributes)) {
    if (value && typeof value === "object" && value.__variable) {
      // Resolve variable using resolveExpression to support complex paths
      // and array literals like "[images[0], images[2]]"
      const variablePath = value.__variable
      const resolvedValue = resolveExpression(data, variablePath)
      resolved[key] = resolvedValue
    } else if (value && typeof value === "object" && value.__interpolate) {
      // Partial interpolation always produces a string
      resolved[key] = replaceVariables(value.__interpolate, data)
    } else {
      resolved[key] = value
    }
  }

  return resolved
}

module.exports = {
  parseCustomTag,
  parseAttributes,
  resolveAttributes,
  findUnquotedGt,
}
