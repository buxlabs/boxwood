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
} = require("../..")

const { findMatchingBracket } = require("./utilities/brackets")

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

function format(text) {
  if (
    !text.includes("*") &&
    !text.includes("`") &&
    !text.includes("[") &&
    !text.includes("!")
  ) {
    return text
  }

  const result = []
  let i = 0

  while (i < text.length) {
    if (text[i] === "!" && text[i + 1] === "[") {
      // Try to parse markdown image ![alt](url)
      const altEnd = text.indexOf("]", i + 2)

      if (altEnd !== -1 && text[altEnd + 1] === "(") {
        const urlEnd = text.indexOf(")", altEnd + 2)

        if (urlEnd !== -1) {
          const alt = text.substring(i + 2, altEnd)
          const src = text.substring(altEnd + 2, urlEnd)
          result.push(Img({ src, alt }))
          i = urlEnd + 1
          continue
        }
      }

      // Not a valid image, treat as regular text (skip both ! and [)
      result.push(text[i])
      i++
    } else if (text[i] === "[") {
      // Try to parse markdown link [text](url)
      const textEnd = findMatchingBracket(text, i)

      if (textEnd !== -1 && text[textEnd + 1] === "(") {
        const urlEnd = text.indexOf(")", textEnd + 2)

        if (urlEnd !== -1) {
          const linkText = text.substring(i + 1, textEnd)
          const url = text.substring(textEnd + 2, urlEnd)
          // Recursively format the link text to support images, bold, italic inside links
          result.push(A({ href: url }, format(linkText)))
          i = urlEnd + 1
          continue
        }
      }

      // Not a valid link, treat as regular text
      result.push(text[i])
      i++
    } else if (text[i] === "`") {
      const end = text.indexOf("`", i + 1)
      if (end === -1) {
        result.push(text[i])
        i++
      } else {
        result.push(Code({}, text.substring(i + 1, end)))
        i = end + 1
      }
    } else if (text[i] === "*" && text[i + 1] === "*") {
      const end = text.indexOf("**", i + 2)
      if (end === -1) {
        result.push(text[i])
        i++
      } else {
        result.push(Strong(format(text.substring(i + 2, end))))
        i = end + 2
      }
    } else if (text[i] === "*") {
      const end = text.indexOf("*", i + 1)
      if (end === -1) {
        result.push(text[i])
        i++
      } else {
        result.push(Em(format(text.substring(i + 1, end))))
        i = end + 1
      }
    } else {
      // Find next special character
      const positions = [
        text.indexOf("`", i),
        text.indexOf("*", i),
        text.indexOf("[", i),
      ].filter((pos) => pos !== -1)

      // Look for image pattern ![
      const exclamPos = text.indexOf("!", i)
      if (exclamPos !== -1 && text[exclamPos + 1] === "[") {
        positions.push(exclamPos)
      }

      const next = positions.length > 0 ? Math.min(...positions) : text.length

      result.push(text.substring(i, next))
      if (next === text.length) break
      i = next
    }
  }

  return result.length > 0 ? result : text
}

function Markdown(params, children) {
  if (Array.isArray(children)) {
    return children.map((child) => Markdown(params, child))
  }

  if (typeof children !== "string") {
    return null
  }

  const lines = children
    .trim()
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      // Preserve leading spaces for indentation tracking
      const trimmed = line.trim()
      const leadingSpaces = line.length - line.trimStart().length
      return { text: trimmed, indent: leadingSpaces }
    })

  const items = lines
    .map(({ text, indent }) => {
      if (HORIZONTAL_RULE_REGEXP.test(text)) {
        return { type: "hr", indent }
      }

      if (UNORDERED_MARKERS.some((marker) => text.startsWith(marker))) {
        const content = text.substring(2)
        if (!content) return null
        return { type: "li", list: "ul", content, indent }
      }

      if (ORDERED_LIST_REGEXP.test(text)) {
        const content = text.replace(ORDERED_LIST_REGEXP, "")
        if (!content) return null
        return { type: "li", list: "ol", content, indent }
      }

      for (const { prefix, type } of HEADINGS) {
        if (text.startsWith(prefix)) {
          return { type, content: text.substring(prefix.length), indent }
        }
      }

      if (text.startsWith("> ")) {
        return { type: "blockquote", content: text.substring(2), indent }
      }

      return { type: "p", content: text, indent }
    })
    .filter(Boolean)

  const nodes = []
  let i = 0

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
      const content = [format(item.content)]
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

      nodes.push(Blockquote(params, P(params, format(lines.join("\n")))))
    } else if (item.type === "hr") {
      nodes.push(Hr(params))
      i++
    } else {
      const { type, content } = item
      const Component = COMPONENTS[type] || P
      nodes.push(Component(params, format(content)))
      i++
    }
  }

  return nodes
}

module.exports = component(Markdown)
