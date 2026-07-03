const { parseCustomTag } = require("./parseCustomTag")
const { replaceVariables } = require("./replaceVariables")
const { format } = require("./format")

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
 * Determines the type and content of a markdown line
 */
function parseMarkdownLine(
  line,
  orderedListRegexp,
  unorderedMarkers,
  horizontalRuleRegexp,
  headings,
) {
  const trimmed = line.trim()
  const leadingSpaces = line.length - line.trimStart().length

  // Horizontal rule
  if (horizontalRuleRegexp.test(trimmed)) {
    return { type: "hr", indent: leadingSpaces }
  }

  // Unordered list
  const unorderedMarker = unorderedMarkers.find((marker) =>
    trimmed.startsWith(marker),
  )
  if (unorderedMarker) {
    const content = trimmed.substring(2)
    if (content) {
      return { type: "li", list: "ul", content, indent: leadingSpaces }
    }
  }

  // Ordered list
  if (orderedListRegexp.test(trimmed)) {
    const content = trimmed.replace(orderedListRegexp, "")
    if (content) {
      return { type: "li", list: "ol", content, indent: leadingSpaces }
    }
  }

  // Headings
  for (const { prefix, type } of headings) {
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
function parseMarkdownLines(
  children,
  allComponents,
  data,
  patterns,
) {
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
    const customTag = parseCustomTag(line, allComponents)
    if (customTag) {
      const result = processCustomComponent(
        line,
        allLines,
        i,
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

    // Parse regular markdown line
    const item = parseMarkdownLine(
      line,
      patterns.orderedListRegexp,
      patterns.unorderedMarkers,
      patterns.horizontalRuleRegexp,
      patterns.headings,
    )
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
  collectComponentContent,
  processCustomComponent,
  parseMarkdownLine,
  parseMarkdownLines,
}
