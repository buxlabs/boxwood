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
} = require("../..")

function Markdown(params, children) {
  if (typeof children === "string") {
    const lines = children
      .trim()
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)

    const items = lines.map((line) => {
      if (line.startsWith("- ") || line.startsWith("— ")) {
        return { type: "li", list: "ul", content: line.substring(2) }
      } else if (/^\d+\.\s/.test(line)) {
        return { type: "li", list: "ol", content: line.replace(/^\d+\.\s/, "") }
      } else if (line.startsWith("# ")) {
        return { type: "h1", content: line.substring(2) }
      } else if (line.startsWith("## ")) {
        return { type: "h2", content: line.substring(3) }
      } else if (line.startsWith("### ")) {
        return { type: "h3", content: line.substring(4) }
      } else if (line.startsWith("#### ")) {
        return { type: "h4", content: line.substring(5) }
      } else if (line.startsWith("##### ")) {
        return { type: "h5", content: line.substring(6) }
      } else if (line.startsWith("###### ")) {
        return { type: "h6", content: line.substring(7) }
      } else if (line.startsWith("> ")) {
        return { type: "blockquote", content: line.substring(2) }
      } else {
        return { type: "p", content: line }
      }
    })

    const nodes = []
    let i = 0

    while (i < items.length) {
      const item = items[i]

      if (item.type === "li") {
        const list = []
        const parent = item.list

        while (i < items.length && items[i].type === "li" && items[i].list === parent) {
          list.push(Li(params, items[i].content))
          i++
        }

        if (parent === "ul") {
          nodes.push(Ul(params, list))
        } else if (parent === "ol") {
          nodes.push(Ol(params, list))
        }
      } else {
        const { type, content } = item

        switch (type) {
          case "h1":
            nodes.push(H1(params, content))
            break
          case "h2":
            nodes.push(H2(params, content))
            break
          case "h3":
            nodes.push(H3(params, content))
            break
          case "h4":
            nodes.push(H4(params, content))
            break
          case "h5":
            nodes.push(H5(params, content))
            break
          case "h6":
            nodes.push(H6(params, content))
            break
          case "blockquote":
            nodes.push(Blockquote(params, content))
            break
          default:
            nodes.push(P(params, content))
        }

        i++
      }
    }

    return nodes
  } else {
    return null
  }
}

module.exports = component(Markdown)
