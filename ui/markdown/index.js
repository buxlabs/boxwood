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
        return H1(text)
      } else if (line.startsWith("## ")) {
        const text = line.substring(3)
        return H2(text)
      } else if (line.startsWith("### ")) {
        const text = line.substring(4)
        return H3(text)
      } else if (line.startsWith("#### ")) {
        const text = line.substring(5)
        return H4(text)
      } else if (line.startsWith("##### ")) {
        const text = line.substring(6)
        return H5(text)
      } else if (line.startsWith("###### ")) {
        const text = line.substring(7)
        return H6(text)
      } else if (line.startsWith("> ")) {
        const text = line.substring(2)
        return Blockquote(text)
      }

      return P(line)
    })
  }
}

module.exports = component(Markdown)
