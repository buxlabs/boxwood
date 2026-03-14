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
} = require("../..")

const ORDERED_LIST_REGEXP = /^\d+\.\s/
const UNORDERED_MARKERS = ["- ", "— ", "– ", "• "]
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
}

function format(text) {
  const result = []
  let i = 0

  while (i < text.length) {
    if (text[i] === "*" && text[i + 1] === "*") {
      const start = i + 2
      const end = text.indexOf("**", start)
      if (end === -1) {
        result.push(text[i])
        i++
      } else {
        result.push(Strong(text.substring(start, end)))
        i = end + 2
      }
    } else if (text[i] === "*") {
      const start = i + 1
      const end = text.indexOf("*", start)
      if (end === -1) {
        result.push(text[i])
        i++
      } else {
        result.push(Em(text.substring(start, end)))
        i = end + 1
      }
    } else {
      const next = text.indexOf("*", i)
      if (next === -1) {
        result.push(text.substring(i))
        break
      }
      result.push(text.substring(i, next))
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
    .map((line) => line.trim())
    .filter(Boolean)

  const items = lines
    .map((line) => {
      if (UNORDERED_MARKERS.some((marker) => line.startsWith(marker))) {
        const content = line.substring(2)
        if (!content) return null
        return { type: "li", list: "ul", content }
      }

      if (ORDERED_LIST_REGEXP.test(line)) {
        const content = line.replace(ORDERED_LIST_REGEXP, "")
        if (!content) return null
        return { type: "li", list: "ol", content }
      }

      for (const { prefix, type } of HEADINGS) {
        if (line.startsWith(prefix)) {
          return { type, content: line.substring(prefix.length) }
        }
      }

      if (line.startsWith("> ")) {
        return { type: "blockquote", content: line.substring(2) }
      }

      return { type: "p", content: line }
    })
    .filter(Boolean)

  const nodes = []
  let i = 0

  while (i < items.length) {
    const item = items[i]

    if (item.type === "li") {
      const list = []
      const parent = item.list

      while (
        i < items.length &&
        items[i].type === "li" &&
        items[i].list === parent
      ) {
        list.push(Li(params, format(items[i].content)))
        i++
      }

      if (parent === "ul") {
        nodes.push(Ul(params, list))
      } else if (parent === "ol") {
        nodes.push(Ol(params, list))
      }
    } else if (item.type === "blockquote") {
      const lines = []

      while (i < items.length && items[i].type === "blockquote") {
        lines.push(items[i].content)
        i++
      }

      nodes.push(Blockquote(params, P(params, format(lines.join("\n")))))
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
