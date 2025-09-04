const { css, component, Div } = require("../..")
const {
  normalizeGap,
  normalizeFlex,
  normalizeBreakpoint,
  normalizeWidth,
  normalizeSpacing,
} = require("../normalize")

function Group(
  { align, className, breakpoint, justify, gap, width, margin, padding, style },
  children
) {
  gap = normalizeGap(gap)
  align = normalizeFlex(align)
  justify = normalizeFlex(justify)
  breakpoint = normalizeBreakpoint(breakpoint)
  width = normalizeWidth(width)
  margin = normalizeSpacing(margin)
  padding = normalizeSpacing(padding)

  const styleObject = {
    display: "flex",
    "flex-direction": "row",
    ...(gap && { gap }),
    ...(align && { "align-items": align }),
    ...(justify && { "justify-content": justify }),
    ...(width && { width }),
    ...(margin && { margin }),
    ...(padding && { padding }),
    ...(breakpoint && {
      [`@media (max-width: ${breakpoint})`]: {
        "flex-direction": "column",
      },
    }),
  }

  const styles = css`
    .group {
      ${css.create(styleObject).toString()}
    }
  `

  return [
    Div({ className: [styles.group, className], style }, children),
    styles.css,
  ]
}

module.exports = component(Group)
