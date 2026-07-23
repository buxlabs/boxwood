const { parseCustomTag } = require("./parseCustomTag")
const { replaceVariables } = require("./replaceVariables")
const { format } = require("./format")

// Markdown patterns
const ORDERED_LIST_REGEXP = /^\d+\.\s/
const UNORDERED_MARKERS = ["- ", "— ", "– ", "• "]
const HORIZONTAL_RULE_REGEXP = /^(?:\*\s*\*\s*\*+|-\s*-\s*-+|_\s*_\s*_+)\s*$/
const HEADINGS = [
  { prefix: "###### ", type: "h6" },
  { prefix: "##### ", type: "h5" },
  { prefix: "#### ", type: "h4" },
  { prefix: "### ", type: "h3" },
  { prefix: "## ", type: "h2" },
  { prefix: "# ", type: "h1" },
]

/**
 * Checks if a line is a code block delimiter (```)
 */
function isCodeBlockDelimiter(trimmedLine) {
  return trimmedLine.startsWith("```")
}

/**
 * Parses a code block starting from the current index
 * Returns the code block item and the next index to process
 */
function parseCodeBlock(allLines, startIndex) {
  const line = allLines[startIndex]
  const language = line.trim().substring(3).trim()
  const codeLines = []
  let i = startIndex + 1

  // Collect lines until closing ```
  while (i < allLines.length) {
    const codeLine = allLines[i]
    if (isCodeBlockDelimiter(codeLine.trim())) {
      i++ // Skip closing delimiter
      break
    }
    codeLines.push(codeLine)
    i++
  }

  return {
    item: {
      type: "pre",
      content: codeLines.join("\n"),
      language: language || undefined,
      indent: 0,
    },
    nextIndex: i,
  }
}

/**
 * Scan a line for a > outside quoted attribute values
 * Quote state carries across lines via the state object, so quoted values
 * may span multiple lines
 * @param {string} line - The line to scan
 * @param {{quote: string|null}} state - Carried quote state (mutated)
 * @returns {boolean} - True when the line contains an unquoted >
 */
function scanUnquotedGt(line, state) {
  let found = false
  for (const char of line) {
    if (state.quote) {
      if (char === state.quote) state.quote = null
      continue
    }
    if (char === '"' || char === "'") {
      state.quote = char
      continue
    }
    if (char === ">") found = true
  }
  return found
}

/**
 * Parses a custom component tag whose attributes span multiple lines, e.g.
 * <Gallery images="{[
 *   images[0],
 *   images[1]
 * ]}" />
 * Joins lines until the first > outside quoted values and parses the result
 * as a single tag (a quoted "5 > 3" does not end the tag)
 * Returns the parsed tag and the index of the line that closes it, or null
 */
function parseMultilineTag(allLines, startIndex, allComponents) {
  if (!allComponents || typeof allComponents !== "object") {
    return null
  }

  const trimmed = allLines[startIndex].trim()
  const match = trimmed.match(/^<([A-Za-z][A-Za-z0-9-]*)(\s|$)/)
  if (!match || !allComponents[match[1]]) {
    return null
  }
  // The tag closes on this line - not a multi-line tag
  const state = { quote: null }
  if (scanUnquotedGt(allLines[startIndex], state)) {
    return null
  }

  const lines = [allLines[startIndex]]
  for (let i = startIndex + 1; i < allLines.length; i++) {
    // A blank line ends the markdown block - the candidate is not a tag,
    // so plain text starting with a component name is never swallowed
    if (!allLines[i].trim()) {
      return null
    }
    lines.push(allLines[i])
    if (scanUnquotedGt(allLines[i], state)) {
      const tag = parseCustomTag(lines.join("\n"), allComponents)
      return tag ? { tag, endIndex: i } : null
    }
  }

  return null
}

/**
 * Collects content lines for a multi-line custom component
 */
function collectComponentContent(allLines, startIndex, tagName, allComponents) {
  const contentLines = []
  let i = startIndex
  let depth = 1

  while (i < allLines.length && depth > 0) {
    const contentLine = allLines[i]
    const contentTag = parseCustomTag(contentLine, allComponents)

    if (contentTag && contentTag.tagName === tagName) {
      if (contentTag.type === "custom-component-open") {
        depth++
        contentLines.push(contentLine)
      } else if (contentTag.type === "custom-component-close") {
        depth--
        if (depth === 0) {
          i++
          break
        }
        contentLines.push(contentLine)
      }
    } else if (!contentTag) {
      // A nested same-name tag whose attributes span multiple lines also
      // affects depth - consume its whole span so its closing tag matches
      const multiline = parseMultilineTag(allLines, i, allComponents)
      if (multiline && multiline.tag.tagName === tagName) {
        if (multiline.tag.type === "custom-component-open") {
          depth++
        }
        for (let j = i; j <= multiline.endIndex; j++) {
          contentLines.push(allLines[j])
        }
        i = multiline.endIndex + 1
        continue
      }
      contentLines.push(contentLine)
    } else {
      contentLines.push(contentLine)
    }
    i++
  }

  return {
    content: contentLines.join("\n"),
    nextIndex: i,
  }
}

/**
 * Processes a custom component tag and returns the appropriate item
 */
function processCustomComponent(
  line,
  allLines,
  currentIndex,
  customTag,
  data,
  allComponents,
) {
  const indent = line.length - line.trimStart().length

  // Single-line component with content
  if (customTag.type === "custom-component-single-line") {
    const processedContent = replaceVariables(customTag.content, data)
    const formattedContent = format(processedContent, allComponents)
    return {
      item: {
        type: "custom-component",
        tagName: customTag.tagName,
        component: customTag.component,
        attributes: customTag.attributes,
        content: formattedContent,
        selfClosing: false,
        singleLine: true,
        indent,
      },
      nextIndex: currentIndex + 1,
    }
  }

  // Self-closing component
  if (customTag.type === "custom-component" && customTag.selfClosing) {
    return {
      item: {
        type: "custom-component",
        tagName: customTag.tagName,
        component: customTag.component,
        attributes: customTag.attributes,
        selfClosing: true,
        indent,
      },
      nextIndex: currentIndex + 1,
    }
  }

  // Multi-line component
  if (customTag.type === "custom-component-open") {
    const { content, nextIndex } = collectComponentContent(
      allLines,
      currentIndex + 1,
      customTag.tagName,
      allComponents,
    )

    return {
      item: {
        type: "custom-component",
        tagName: customTag.tagName,
        component: customTag.component,
        attributes: customTag.attributes,
        content,
        selfClosing: false,
        indent,
      },
      nextIndex,
    }
  }

  return null
}

/**
 * Split a table row into trimmed cells, honoring escaped \| pipes
 * "| a | b |" -> ["a", "b"]
 */
function splitTableRow(line) {
  let trimmed = line.trim()
  if (trimmed.startsWith("|")) {
    trimmed = trimmed.substring(1)
  }
  if (trimmed.endsWith("|") && !trimmed.endsWith("\\|")) {
    trimmed = trimmed.substring(0, trimmed.length - 1)
  }

  const cells = []
  let current = ""
  for (let i = 0; i < trimmed.length; i++) {
    const char = trimmed[i]
    if (char === "\\" && trimmed[i + 1] === "|") {
      current += "|"
      i++
      continue
    }
    if (char === "|") {
      cells.push(current.trim())
      current = ""
      continue
    }
    current += char
  }
  cells.push(current.trim())
  return cells
}

/**
 * Checks if a line is a table separator row, e.g. | --- | :---: | ---: |
 */
function isTableSeparator(trimmed) {
  if (!trimmed.startsWith("|")) {
    return false
  }
  const cells = splitTableRow(trimmed)
  return cells.length > 0 && cells.every((cell) => /^:?-+:?$/.test(cell))
}

/**
 * Parses a table block: a header row, a separator row and body rows
 * Returns the table item and the next index to process
 */
function parseTable(allLines, startIndex) {
  const line = allLines[startIndex]
  const header = splitTableRow(line)

  // Column alignment comes from the separator row (:--- :---: ---:)
  const aligns = splitTableRow(allLines[startIndex + 1]).map((cell) => {
    const left = cell.startsWith(":")
    const right = cell.endsWith(":")
    if (left && right) return "center"
    if (right) return "right"
    return null
  })

  const rows = []
  let i = startIndex + 2
  while (i < allLines.length && allLines[i].trim().startsWith("|")) {
    const cells = splitTableRow(allLines[i]).slice(0, header.length)
    // Normalize short rows to the header width
    while (cells.length < header.length) {
      cells.push("")
    }
    rows.push(cells)
    i++
  }

  return {
    item: {
      type: "table",
      header,
      aligns,
      rows,
      indent: line.length - line.trimStart().length,
    },
    nextIndex: i,
  }
}

/**
 * Determines the type and content of a markdown line
 */
function parseMarkdownLine(line) {
  const trimmed = line.trim()
  const leadingSpaces = line.length - line.trimStart().length

  // Horizontal rule
  if (HORIZONTAL_RULE_REGEXP.test(trimmed)) {
    return { type: "hr", indent: leadingSpaces }
  }

  // Task list items: [ ] todo, [x] done - GFM allows them in both list types
  // The text may be empty ("- [ ]" renders a bare checkbox)
  const listItem = (list, content) => {
    const task = content.match(/^\[([ xX])\](?:\s+(.*))?$/)
    if (task) {
      return {
        type: "li",
        list,
        task: true,
        checked: task[1] !== " ",
        content: task[2] || "",
        indent: leadingSpaces,
      }
    }
    return { type: "li", list, content, indent: leadingSpaces }
  }

  // Unordered list
  const unorderedMarker = UNORDERED_MARKERS.find((marker) =>
    trimmed.startsWith(marker),
  )
  if (unorderedMarker) {
    const content = trimmed.substring(2)
    if (content) {
      return listItem("ul", content)
    }
  }

  // Ordered list
  if (ORDERED_LIST_REGEXP.test(trimmed)) {
    const content = trimmed.replace(ORDERED_LIST_REGEXP, "")
    if (content) {
      return listItem("ol", content)
    }
  }

  // Headings
  for (const { prefix, type } of HEADINGS) {
    if (trimmed.startsWith(prefix)) {
      return {
        type,
        content: trimmed.substring(prefix.length),
        indent: leadingSpaces,
      }
    }
  }

  // Blockquote
  if (trimmed.startsWith("> ")) {
    return {
      type: "blockquote",
      content: trimmed.substring(2),
      indent: leadingSpaces,
    }
  }

  // Default to paragraph
  return { type: "p", content: trimmed, indent: leadingSpaces }
}

/**
 * Parses all lines of markdown into structured items
 */
function parseMarkdownLines(children, allComponents, data) {
  const allLines = children.trim().split("\n")
  const items = []
  let i = 0

  while (i < allLines.length) {
    const line = allLines[i]
    const trimmed = line.trim()

    // Skip empty lines
    if (trimmed.length === 0) {
      i++
      continue
    }

    // Check for custom component tags
    let customTag = parseCustomTag(line, allComponents)
    let tagEndIndex = i
    if (!customTag) {
      // Tag attributes may span multiple lines
      const multiline = parseMultilineTag(allLines, i, allComponents)
      if (multiline) {
        customTag = multiline.tag
        tagEndIndex = multiline.endIndex
      }
    }
    if (customTag) {
      const result = processCustomComponent(
        line,
        allLines,
        tagEndIndex,
        customTag,
        data,
        allComponents,
      )
      if (result) {
        items.push(result.item)
        i = result.nextIndex
        continue
      }
    }

    // Check for code blocks
    if (isCodeBlockDelimiter(trimmed)) {
      const { item, nextIndex } = parseCodeBlock(allLines, i)
      items.push(item)
      i = nextIndex
      continue
    }

    // Check for tables: a header row followed by a separator row
    if (
      trimmed.startsWith("|") &&
      i + 1 < allLines.length &&
      isTableSeparator(allLines[i + 1].trim())
    ) {
      const { item, nextIndex } = parseTable(allLines, i)
      items.push(item)
      i = nextIndex
      continue
    }

    // Parse regular markdown line
    const item = parseMarkdownLine(line)
    if (item) {
      items.push(item)
    }

    i++
  }

  return items
}

module.exports = {
  isCodeBlockDelimiter,
  parseCodeBlock,
  parseMultilineTag,
  scanUnquotedGt,
  splitTableRow,
  isTableSeparator,
  parseTable,
  collectComponentContent,
  processCustomComponent,
  parseMarkdownLine,
  parseMarkdownLines,
}
