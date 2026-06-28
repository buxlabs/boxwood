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

  // First pass: detect code blocks before processing lines
  const allLines = children.trim().split("\n")
  const items = []
  let i = 0

  while (i < allLines.length) {
    const line = allLines[i]
    const trimmed = line.trim()

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
      const content = [format(item.content, INLINE_COMPONENTS)]
      currentIndex++

      // Check if next item is a nested list
      const nextItem = items[currentIndex]
      if (nextItem?.type === "li" && nextItem.indent > item.indent) {
        const nestedResult = parseList(currentIndex, nextItem.indent)
        content.push(nestedResult.list)
        currentIndex = nestedResult.nextIndex
      }

      list.push(Li(params, content))
    }

    const listElement =
      parentListType === "ul" ? Ul(params, list) : Ol(params, list)

    return { list: listElement, nextIndex: currentIndex }
  }

  while (i < items.length) {
    const item = items[i]

    if (item.type === "li") {
      const result = parseList(i, item.indent)
      nodes.push(result.list)
      i = result.nextIndex
    } else if (item.type === "blockquote") {
      const lines = []

      while (i < items.length && items[i].type === "blockquote") {
        lines.push(items[i].content)
        i++
      }

      nodes.push(
        Blockquote(
          params,
          P(params, format(lines.join("\n"), INLINE_COMPONENTS)),
        ),
      )
    } else if (item.type === "hr") {
      nodes.push(Hr(params))
      i++
    } else if (item.type === "pre") {
      // Code blocks - wrap in <pre><code>
      const codeParams = item.language
        ? { class: `language-${item.language}` }
        : {}
      nodes.push(Pre(params, Code(codeParams, item.content)))
      i++
    } else {
      const { type, content } = item
      const Component = COMPONENTS[type] || P
      nodes.push(Component(params, format(content, INLINE_COMPONENTS)))
      i++
    }
  }

  return nodes
}

module.exports = component(Markdown)
