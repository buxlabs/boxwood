const { css, component, Div } = require("../..")
const { normalizeGap, normalizeFlex, normalizeWidth } = require("../normalize")

function Stack({ align, justify, gap, width, style }, children) {
  gap = normalizeGap(gap)
  align = normalizeFlex(align)
  justify = normalizeFlex(justify)
  width = normalizeWidth(width)

  const styleObject = {
    display: "flex",
    "flex-direction": "column",
    ...(gap && { gap }),
    ...(align && { "align-items": align }),
    ...(justify && { "justify-content": justify }),
    ...(width && { width }),
  }

  const styles = css`
    .stack {
      ${css.create(styleObject).toString()}
    }
  `

  return [Div({ className: styles.stack, style }, children), styles.css]
}

module.exports = component(Stack)
