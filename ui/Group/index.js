const { css, component, Div } = require("../..")
const {
  normalizeGap,
  normalizeFlex,
  normalizeBreakpoint,
  normalizeWidth,
} = require("../normalize")

function Group({ align, breakpoint, justify, gap, width, style }, children) {
  gap = normalizeGap(gap)
  align = normalizeFlex(align)
  justify = normalizeFlex(justify)
  breakpoint = normalizeBreakpoint(breakpoint)
  width = normalizeWidth(width)

  const styleObject = {
    display: "flex",
    "flex-direction": "row",
    ...(gap && { gap }),
    ...(align && { "align-items": align }),
    ...(justify && { "justify-content": justify }),
    ...(width && { width }),
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

  return [Div({ className: styles.group, style }, children), styles.css]
}

module.exports = component(Group)
