const { css, component, Div } = require("../..")

function normalizeAlign(align) {
  switch (align) {
    case "start":
      return "flex-start"
    case "end":
      return "flex-end"
    default:
      return align
  }
}

function normalizeJustify(justify) {
  switch (justify) {
    case "start":
      return "flex-start"
    case "end":
      return "flex-end"
    default:
      return justify
  }
}

function normalizeGap(gap) {
  if (typeof gap === "number") {
    return `${gap}px`
  }
  switch (gap) {
    case "xs":
      return "0.25rem"
    case "sm":
      return "0.5rem"
    case "md":
      return "1rem"
    case "lg":
      return "2rem"
    case "xl":
      return "4rem"
    case "none":
      return null
    default:
      return gap
  }
}

function Group({ align, justify, gap, style }, children) {
  const stylesheet = css.create({
    display: "flex",
  })

  const normalizedGap = normalizeGap(gap)
  if (normalizedGap) {
    stylesheet.set("gap", normalizedGap)
  }

  const normalizedAlign = normalizeAlign(align)
  if (normalizedAlign) {
    stylesheet.set("align-items", normalizedAlign)
  }

  const normalizedJustify = normalizeJustify(justify)
  if (normalizedJustify) {
    stylesheet.set("justify-content", normalizedJustify)
  }

  const styles = css`
    .group {
      ${stylesheet.toString()}
    }
  `

  return [Div({ className: styles.group, style }, children), styles.css]
}

module.exports = component(Group)
