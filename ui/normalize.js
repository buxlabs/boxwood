/**
 * Converts string numbers to integers
 * @param {string|number} value - The value to convert
 * @returns {number|string} - Integer if string is numeric, otherwise original value
 */
function toNumber(value) {
  if (typeof value === "string" && /^\d+$/.test(value)) {
    return parseInt(value, 10)
  }
  return value
}

/**
 * Converts number or string number to pixel value
 * @param {string|number} value - The value to convert
 * @returns {string|number} - Value with px suffix if numeric, otherwise original value
 */
function toPixels(value) {
  value = toNumber(value)
  if (typeof value === "number") {
    return `${value}px`
  }
  return value
}

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
  
  if (GAP_MAP.hasOwnProperty(gap)) {
    return GAP_MAP[gap]
  }

  return toPixels(gap)
}

const BREAKPOINT_MAP = {
  xs: "575px",
  sm: "767px",
  md: "991px",
  lg: "1199px",
  xl: "1399px",
}

function normalizeBreakpoint(breakpoint) {
  if (BREAKPOINT_MAP.hasOwnProperty(breakpoint)) {
    return BREAKPOINT_MAP[breakpoint]
  }
  return toPixels(breakpoint)
}

function normalizeWidth(width) {
  return toPixels(width)
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
  if (SPACING_MAP.hasOwnProperty(spacing)) {
    return SPACING_MAP[spacing]
  }
  return toPixels(spacing)
}

module.exports = {
  toNumber,
  toPixels,
  normalizeFlex,
  normalizeGap,
  normalizeBreakpoint,
  normalizeWidth,
  normalizeSpacing,
}
