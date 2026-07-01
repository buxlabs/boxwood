/**
 * Parse a custom component tag from markdown
 * Supports both <Component attr="value"> and <Component attr={variable}>
 * @param {string} line - The line to parse
 * @param {Object} customComponents - Map of component names to functions
 * @returns {Object|null} - Parsed tag info or null if not a custom tag
 */
function parseCustomTag(line, customComponents) {
  if (!customComponents || typeof customComponents !== "object") {
    return null
  }

  const trimmed = line.trim()

  // Check for self-closing tag: <ComponentName ... /> (space before / is optional)
  const selfClosingMatch = trimmed.match(
    /^<([A-Za-z][A-Za-z0-9-]*)(\s+[^>]*)?\s*\/>\s*$/,
  )
  if (selfClosingMatch) {
    const [, tagName, attributesStr] = selfClosingMatch
    const component = customComponents[tagName]
    if (component) {
      const attributes = parseAttributes(attributesStr || "")
      return {
        type: "custom-component",
        tagName,
        component,
        attributes,
        selfClosing: true,
      }
    }
  }

  // Check for opening tag: <ComponentName ...>
  const openTagMatch = trimmed.match(
    /^<([A-Za-z][A-Za-z0-9-]*)(\s+[^>]*)?>\s*$/,
  )
  if (openTagMatch) {
    const [, tagName, attributesStr] = openTagMatch
    const component = customComponents[tagName]
    if (component) {
      const attributes = parseAttributes(attributesStr || "")
      return {
        type: "custom-component-open",
        tagName,
        component,
        attributes,
        selfClosing: false,
      }
    }
  }

  // Check for closing tag: </ComponentName>
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
      attributes[name] = value
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
      // Resolve variable
      const variableName = value.__variable
      resolved[key] =
        data && data[variableName] !== undefined
          ? data[variableName]
          : undefined
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
}
