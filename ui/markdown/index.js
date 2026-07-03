const nodes = require("../..")
const { component } = nodes

const { format } = require("./utilities/format")
const {
  parseCustomTag,
  resolveAttributes,
} = require("./utilities/parseCustomTag")
const { replaceVariables } = require("./utilities/replaceVariables")

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

const COMPONENTS = {
  h1: nodes.H1,
  h2: nodes.H2,
  h3: nodes.H3,
  h4: nodes.H4,
  h5: nodes.H5,
  h6: nodes.H6,
  blockquote: nodes.Blockquote,
  hr: nodes.Hr,
}

const INLINE_COMPONENTS = {
  A: nodes.A,
  Img: nodes.Img,
  Code: nodes.Code,
  Strong: nodes.Strong,
  Em: nodes.Em,
}

// Safe builtin HTML tags that can be used as custom components in markdown
// These are always available and don't need to be explicitly passed in params.components
const SAFE_TAG_NAMES = [
  // Containers
  "div",
  "span",
  // Semantic structure
  "article",
  "section",
  "header",
  "footer",
  "main",
  "aside",
  "nav",
  // Headings
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  // Text formatting
  "p",
  "strong",
  "em",
  "b",
  "i",
  "u",
  "s",
  "small",
  "mark",
  "sub",
  "sup",
  "br",
  "wbr",
  "abbr",
  "cite",
  "q",
  "kbd",
  "samp",
  "var",
  "del",
  "ins",
  "dfn",
  // Lists
  "ul",
  "ol",
  "li",
  "dl",
  "dt",
  "dd",
  // Links & media
  "a",
  "img",
  "picture",
  "source",
  // Code
  "code",
  "pre",
  // Tables
  "table",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "th",
  "td",
  "caption",
  "colgroup",
  "col",
  // Block elements
  "blockquote",
  "hr",
  // Figures
  "figure",
  "figcaption",
  // Interactive
  "details",
  "summary",
  // Other semantic
  "address",
  "time",
  "data",
]

// Build BUILTIN_HTML_TAGS dynamically from tag names
const BUILTIN_HTML_TAGS = SAFE_TAG_NAMES.reduce((acc, tagName) => {
  const componentName = tagName.charAt(0).toUpperCase() + tagName.slice(1)
  if (nodes[componentName]) {
    acc[tagName] = nodes[componentName]
  }
  return acc
}, {})

/**
 * Extracts HTML parameters from params object by filtering out special keys
 */
function extractHtmlParams(params) {
  if (!params) return {}
  
  return Object.keys(params).reduce((acc, key) => {
    if (key !== "components" && key !== "data") {
      acc[key] = params[key]
    }
    return acc
  }, {})
}

/**
 * Merges builtin HTML tags with custom components
 */
function mergeComponents(customComponents) {
  return {
    ...BUILTIN_HTML_TAGS,
    ...customComponents,
  }
}

function Markdown(params, children) {
  // Handle array of children recursively
  if (Array.isArray(children)) {
    return children.map((child) => Markdown(params, child))
  }

  // Only process string content
  if (typeof children !== "string") {
    return null
  }

  const customComponents = params && params.components
  const data = params && params.data
  const allComponents = mergeComponents(customComponents)
  const htmlParams = extractHtmlParams(params)

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
function processCustomComponent(line, allLines, currentIndex, customTag, data, allComponents) {
  const indent = line.length - line.trimStart().length

  // Single-line component with content
  if (customTag.type === "custom-component-single-line") {
    const processedContent = replaceVariables(customTag.content, data)
    const formattedContent = format(processedContent, INLINE_COMPONENTS)
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
      allComponents
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
function parseMarkdownLine(line) {
  const trimmed = line.trim()
  const leadingSpaces = line.length - line.trimStart().length

  // Horizontal rule
  if (HORIZONTAL_RULE_REGEXP.test(trimmed)) {
    return { type: "hr", indent: leadingSpaces }
  }

  // Unordered list
  const unorderedMarker = UNORDERED_MARKERS.find((marker) =>
    trimmed.startsWith(marker)
  )
  if (unorderedMarker) {
    const content = trimmed.substring(2)
    if (content) {
      return { type: "li", list: "ul", content, indent: leadingSpaces }
    }
  }

  // Ordered list
  if (ORDERED_LIST_REGEXP.test(trimmed)) {
    const content = trimmed.replace(ORDERED_LIST_REGEXP, "")
    if (content) {
      return { type: "li", list: "ol", content, indent: leadingSpaces }
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
    const customTag = parseCustomTag(line, allComponents)
    if (customTag) {
      const result = processCustomComponent(line, allLines, i, customTag, data, allComponents)
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
    const item = parseMarkdownLine(line)
    if (item) {
      items.push(item)
    }

    i++
  }

  return items
}

  // Parse all markdown lines into structured items
  const items = parseMarkdownLines(children, allComponents, data)

/**
 * Recursively parses nested lists with proper indentation handling
 */
function parseList(items, startIndex, parentIndent, htmlParams, data) {
  const list = []
  let currentIndex = startIndex
  const parentListType = items[startIndex].list

  while (currentIndex < items.length) {
    const item = items[currentIndex]

    // Stop conditions
    if (item.type !== "li" || item.indent < parentIndent) {
      break
    }

    if (item.indent === parentIndent && item.list !== parentListType) {
      break
    }

    if (item.indent > parentIndent) {
      break
    }

    // Process current list item
    const processedContent = replaceVariables(item.content, data)
    const content = [format(processedContent, INLINE_COMPONENTS)]
    currentIndex++

    // Check for nested lists
    const nextItem = items[currentIndex]
    if (nextItem?.type === "li" && nextItem.indent > item.indent) {
      const nestedResult = parseList(items, currentIndex, nextItem.indent, htmlParams, data)
      content.push(nestedResult.list)
      currentIndex = nestedResult.nextIndex
    }

    list.push(nodes.Li(htmlParams, content))
  }

  const listElement =
    parentListType === "ul"
      ? nodes.Ul(htmlParams, list)
      : nodes.Ol(htmlParams, list)

  return { list: listElement, nextIndex: currentIndex }
}

/**
 * Processes a custom component item into a node
 */
function processCustomComponentItem(item, params, data) {
  const resolvedAttrs = resolveAttributes(item.attributes, data)

  if (item.selfClosing) {
    return item.component(resolvedAttrs)
  }

  if (item.singleLine) {
    return item.component(resolvedAttrs, item.content)
  }

  // Multi-line component with children - recursively process markdown
  const childContent = item.content ? Markdown(params, item.content) : []
  return item.component(resolvedAttrs, childContent)
}

/**
 * Processes blockquote items into a single blockquote node
 */
function processBlockquotes(items, startIndex, htmlParams, data) {
  const lines = []
  let i = startIndex

  while (i < items.length && items[i].type === "blockquote") {
    lines.push(items[i].content)
    i++
  }

  const content = replaceVariables(lines.join("\n"), data)
  const blockquote = nodes.Blockquote(
    htmlParams,
    nodes.P(htmlParams, format(content, INLINE_COMPONENTS))
  )

  return { node: blockquote, nextIndex: i }
}

/**
 * Converts parsed items into final node tree
 */
function convertItemsToNodes(items, params, htmlParams, data) {
  const result = []
  let i = 0

  while (i < items.length) {
    const item = items[i]

    if (item.type === "custom-component") {
      result.push(processCustomComponentItem(item, params, data))
      i++
    } else if (item.type === "li") {
      const listResult = parseList(items, i, item.indent, htmlParams, data)
      result.push(listResult.list)
      i = listResult.nextIndex
    } else if (item.type === "blockquote") {
      const { node, nextIndex } = processBlockquotes(items, i, htmlParams, data)
      result.push(node)
      i = nextIndex
    } else if (item.type === "hr") {
      result.push(nodes.Hr(htmlParams))
      i++
    } else if (item.type === "pre") {
      // Code blocks - wrap in <pre><code>
      const codeParams = item.language
        ? { class: `language-${item.language}` }
        : {}
      result.push(nodes.Pre(htmlParams, nodes.Code(codeParams, item.content)))
      i++
    } else {
      // Regular block elements (h1-h6, p, etc.)
      const { type, content } = item
      const Component = COMPONENTS[type] || nodes.P
      const processedContent = replaceVariables(content, data)
      result.push(
        Component(htmlParams, format(processedContent, INLINE_COMPONENTS))
      )
      i++
    }
  }

  return result
}

  // Convert parsed items into final node tree
  return convertItemsToNodes(items, params, htmlParams, data)
}

module.exports = component(Markdown)
