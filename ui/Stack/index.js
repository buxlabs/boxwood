const { css, component, Div } = require("../..")
const {
  normalizeGap,
  normalizeFlex,
  normalizeWidth,
  normalizeSpacing,
} = require("../normalize")

function Stack(
  { align, className, justify, gap, width, margin, padding, style },
  children
) {
  gap = normalizeGap(gap)
  align = normalizeFlex(align)
  justify = normalizeFlex(justify)
  width = normalizeWidth(width)
  margin = normalizeSpacing(margin)
  padding = normalizeSpacing(padding)

  const styleObject = {
    display: "flex",
    "flex-direction": "column",
    ...(gap && { gap }),
    ...(align && { "align-items": align }),
    ...(justify && { "justify-content": justify }),
    ...(width && { width }),
    ...(margin && { margin }),
    ...(padding && { padding }),
  }

  const styles = css`
    .stack {
      ${css.create(styleObject).toString()}
    }
  `

  return [
    Div({ className: [styles.stack, className], style }, children),
    styles.css,
  ]
}

module.exports = component(Stack)
