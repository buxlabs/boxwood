const {
  component,
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  P,
  Blockquote,
  Ul,
  Ol,
  Li,
  Strong,
  Em,
  Code,
  A,
  Hr,
  Img,
  Pre,
} = require("../..")

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
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  h5: H5,
  h6: H6,
  blockquote: Blockquote,
  hr: Hr,
}

const INLINE_COMPONENTS = { A, Img, Code, Strong, Em }

function Markdown(params, children) {
  if (Array.isArray(children)) {
    return children.map((child) => Markdown(params, child))
  }

  if (typeof children !== "string") {
    return null
  }

  const customComponents = params && params.components
  const data = params && params.data

  // Filter out special params that shouldn't be passed to HTML elements
  const htmlParams = params
    ? Object.keys(params).reduce((acc, key) => {
        if (key !== "components" && key !== "data") {
          acc[key] = params[key]
        }
        return acc
      }, {})
    : {}

  // First pass: detect code blocks before processing lines
  const allLines = children.trim().split("\n")
  const items = []
  let i = 0

  while (i < allLines.length) {
    const line = allLines[i]
    const trimmed = line.trim()

    // Check for custom component tags first
    const customTag = parseCustomTag(line, customComponents)
    if (customTag) {
      if (customTag.type === "custom-component" && customTag.selfClosing) {
        // Self-closing custom component
        items.push({
          type: "custom-component",
          tagName: customTag.tagName,
          component: customTag.component,
          attributes: customTag.attributes,
          selfClosing: true,
          indent: line.length - line.trimStart().length,
        })
        i++
        continue
      } else if (customTag.type === "custom-component-open") {
        // Opening tag of a custom component
        const openIndent = line.length - line.trimStart().length
        const tagName = customTag.tagName
        const componentFn = customTag.component
        const attributes = customTag.attributes
        const contentLines = []
        i++ // Move past opening tag

        // Collect content until closing tag
        let depth = 1
        while (i < allLines.length && depth > 0) {
          const contentLine = allLines[i]
          const contentTag = parseCustomTag(contentLine, customComponents)

          if (contentTag && contentTag.tagName === tagName) {
            if (contentTag.type === "custom-component-open") {
              depth++
              contentLines.push(contentLine)
            } else if (contentTag.type === "custom-component-close") {
              depth--
              if (depth === 0) {
                // Found matching closing tag
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

        items.push({
          type: "custom-component",
          tagName,
          component: componentFn,
          attributes,
          content: contentLines.join("\n"),
          selfClosing: false,
          indent: openIndent,
        })
        continue
      }
    }

    // Check for code block start
    if (trimmed.startsWith("```")) {
      const language = trimmed.substring(3).trim()
      const codeLines = []
      i++ // Move past the opening ```

      // Collect code block lines until closing ```
      while (i < allLines.length) {
        const codeLine = allLines[i]
        if (codeLine.trim().startsWith("```")) {
          // Found closing ```, don't include it
          i++
          break
        }
        codeLines.push(codeLine)
        i++
      }

      items.push({
        type: "pre",
        content: codeLines.join("\n"),
        language: language || undefined,
        indent: 0,
      })
      continue
    }

    // Skip empty lines
    if (trimmed.length === 0) {
      i++
      continue
    }

    const leadingSpaces = line.length - line.trimStart().length

    // Check for other block types
    if (HORIZONTAL_RULE_REGEXP.test(trimmed)) {
      items.push({ type: "hr", indent: leadingSpaces })
    } else if (UNORDERED_MARKERS.some((marker) => trimmed.startsWith(marker))) {
      const content = trimmed.substring(2)
      if (content) {
        items.push({ type: "li", list: "ul", content, indent: leadingSpaces })
      }
    } else if (ORDERED_LIST_REGEXP.test(trimmed)) {
      const content = trimmed.replace(ORDERED_LIST_REGEXP, "")
      if (content) {
        items.push({ type: "li", list: "ol", content, indent: leadingSpaces })
      }
    } else {
      let matched = false
      for (const { prefix, type } of HEADINGS) {
        if (trimmed.startsWith(prefix)) {
          items.push({
            type,
            content: trimmed.substring(prefix.length),
            indent: leadingSpaces,
          })
          matched = true
          break
        }
      }

      if (!matched) {
        if (trimmed.startsWith("> ")) {
          items.push({
            type: "blockquote",
            content: trimmed.substring(2),
            indent: leadingSpaces,
          })
        } else {
          items.push({ type: "p", content: trimmed, indent: leadingSpaces })
        }
      }
    }

    i++
  }

  const nodes = []
  i = 0

  function parseList(startIndex, parentIndent) {
    const list = []
    let currentIndex = startIndex
    const parentListType = items[startIndex].list

    while (currentIndex < items.length) {
      const item = items[currentIndex]

      // Stop if not a list item or indent is less than expected
      if (item.type !== "li" || item.indent < parentIndent) {
        break
      }

      // Stop if indent matches but list type differs
      if (item.indent === parentIndent && item.list !== parentListType) {
        break
      }

      // Skip items with greater indent (they belong to nested lists)
      if (item.indent > parentIndent) {
        break
      }

      // Process current item at the correct indent level
      const processedContent = replaceVariables(item.content, data)
      const content = [format(processedContent, INLINE_COMPONENTS)]
      currentIndex++

      // Check if next item is a nested list
      const nextItem = items[currentIndex]
      if (nextItem?.type === "li" && nextItem.indent > item.indent) {
        const nestedResult = parseList(currentIndex, nextItem.indent)
        content.push(nestedResult.list)
        currentIndex = nestedResult.nextIndex
      }

      list.push(Li(htmlParams, content))
    }

    const listElement =
      parentListType === "ul" ? Ul(htmlParams, list) : Ol(htmlParams, list)

    return { list: listElement, nextIndex: currentIndex }
  }

  while (i < items.length) {
    const item = items[i]

    if (item.type === "custom-component") {
      // Handle custom component
      const resolvedAttrs = resolveAttributes(item.attributes, data)

      if (item.selfClosing) {
        // Self-closing component
        nodes.push(item.component(resolvedAttrs))
      } else {
        // Component with children - recursively process markdown content
        const childContent = item.content ? Markdown(params, item.content) : []
        nodes.push(item.component(resolvedAttrs, childContent))
      }
      i++
    } else if (item.type === "li") {
      const result = parseList(i, item.indent)
      nodes.push(result.list)
      i = result.nextIndex
    } else if (item.type === "blockquote") {
      const lines = []

      while (i < items.length && items[i].type === "blockquote") {
        lines.push(items[i].content)
        i++
      }

      const content = replaceVariables(lines.join("\n"), data)
      nodes.push(
        Blockquote(
          htmlParams,
          P(htmlParams, format(content, INLINE_COMPONENTS)),
        ),
      )
    } else if (item.type === "hr") {
      nodes.push(Hr(htmlParams))
      i++
    } else if (item.type === "pre") {
      // Code blocks - wrap in <pre><code>
      const codeParams = item.language
        ? { class: `language-${item.language}` }
        : {}
      nodes.push(Pre(htmlParams, Code(codeParams, item.content)))
      i++
    } else {
      const { type, content } = item
      const Component = COMPONENTS[type] || P
      const processedContent = replaceVariables(content, data)
      nodes.push(
        Component(htmlParams, format(processedContent, INLINE_COMPONENTS)),
      )
      i++
    }
  }

  return nodes
}

module.exports = component(Markdown)
