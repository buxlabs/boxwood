const { component, H1, H2, H3, H4, H5, H6, P, Blockquote } = require("../..")

function Markdown(params, children) {
  if (typeof children === "string") {
    const lines = children
      .trim()
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)

    return lines.map((line) => {
      if (line.startsWith("# ")) {
        const text = line.substring(2)
        return H1(params, text)
      } else if (line.startsWith("## ")) {
        const text = line.substring(3)
        return H2(params, text)
      } else if (line.startsWith("### ")) {
        const text = line.substring(4)
        return H3(params, text)
      } else if (line.startsWith("#### ")) {
        const text = line.substring(5)
        return H4(params, text)
      } else if (line.startsWith("##### ")) {
        const text = line.substring(6)
        return H5(params, text)
      } else if (line.startsWith("###### ")) {
        const text = line.substring(7)
        return H6(params, text)
      } else if (line.startsWith("> ")) {
        const text = line.substring(2)
        return Blockquote(params, text)
      }

      return P(params, line)
    })
  } else {
    return null
  }
}

module.exports = component(Markdown)
