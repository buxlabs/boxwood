const { css, component, Div } = require("../..")

function normalizeFlex(align) {
  switch (align) {
    case "start":
      return "flex-start"
    case "end":
      return "flex-end"
    default:
      return align
  }
}

const GAP_MAP = {
  xs: "0.25rem",
  sm: "0.5rem",
  md: "1rem",
  lg: "2rem",
  xl: "4rem",
  none: null,
}

function normalizeGap(gap) {
  if (!gap) {
    return "1rem"
  }
  if (typeof gap === "number") {
    return `${gap}px`
  }

  if (GAP_MAP.hasOwnProperty(gap)) {
    return GAP_MAP[gap]
  }

  return gap
}

const BREAKPOINT_MAP = {
  xs: "575px",
  sm: "767px",
  md: "991px",
  lg: "1199px",
  xl: "1399px",
}

function normalizeBreakpoint(breakpoint) {
  if (typeof breakpoint === "number") {
    return `${breakpoint}px`
  }
  if (BREAKPOINT_MAP.hasOwnProperty(breakpoint)) {
    return BREAKPOINT_MAP[breakpoint]
  }
  return breakpoint
}

function normalizeWidth(width) {
  if (typeof width === "number") {
    return `${width}px`
  }
  return width
}

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
