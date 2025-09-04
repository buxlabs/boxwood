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

const SPACING_MAP = {
  xs: "0.25rem",
  sm: "0.5rem",
  md: "1rem",
  lg: "2rem",
  xl: "4rem",
  none: null,
}

function normalizeSpacing(spacing) {
  if (typeof spacing === "number") {
    return `${spacing}px`
  }
  if (SPACING_MAP.hasOwnProperty(spacing)) {
    return SPACING_MAP[spacing]
  }
  return spacing
}

module.exports = {
  normalizeFlex,
  normalizeGap,
  normalizeBreakpoint,
  normalizeWidth,
  normalizeSpacing,
}
