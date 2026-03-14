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
  Li,
} = require("../..")

function Markdown(params, children) {
  if (typeof children === "string") {
    const lines = children
      .trim()
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)

    const nodes = []
    let list = null

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      if (line.startsWith("- ") || line.startsWith("— ")) {
        if (!list) {
          list = []
        }

        list.push(Li(params, line.substring(2)))
      } else {
        if (list) {
          nodes.push(Ul(params, list))
          list = null
        }

        if (line.startsWith("# ")) {
          const text = line.substring(2)
          nodes.push(H1(params, text))
        } else if (line.startsWith("## ")) {
          const text = line.substring(3)
          nodes.push(H2(params, text))
        } else if (line.startsWith("### ")) {
          const text = line.substring(4)
          nodes.push(H3(params, text))
        } else if (line.startsWith("#### ")) {
          const text = line.substring(5)
          nodes.push(H4(params, text))
        } else if (line.startsWith("##### ")) {
          const text = line.substring(6)
          nodes.push(H5(params, text))
        } else if (line.startsWith("###### ")) {
          const text = line.substring(7)
          nodes.push(H6(params, text))
        } else if (line.startsWith("> ")) {
          const text = line.substring(2)
          nodes.push(Blockquote(params, text))
        } else {
          nodes.push(P(params, line))
        }
      }
    }

    // Close any remaining list
    if (list) {
      nodes.push(Ul(params, list))
    }

    return nodes
  } else {
    return null
  }
}

module.exports = component(Markdown)
