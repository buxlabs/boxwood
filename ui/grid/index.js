const { component, css, Div } = require("../..")
const { normalizeGap, normalizeBreakpoint } = require("../normalize")

const BREAKPOINTS = {
  xl: "1199px",
  lg: "1023px",
  md: "767px",
  sm: "575px",
}

function Grid({ className, columns = 3, gap, breakpoint, style }, children) {
  gap = normalizeGap(gap)
  breakpoint = normalizeBreakpoint(breakpoint)

  const styleObject = {
    "box-sizing": "border-box",
    display: "grid",
    gap,
    ...(typeof columns === "number" && {
      "grid-template-columns": `repeat(${columns}, 1fr)`,
    }),
    ...(typeof columns === "string" && {
      "grid-template-columns": columns,
    }),
    ...(typeof columns === "object" &&
      Object.keys(columns).reduce((object, key) => {
        if (key === "default") {
          object["grid-template-columns"] = columns[key]
        } else if (typeof key === "string") {
          const value =
            BREAKPOINTS[key] || (key.endsWith("px") ? key : `${key}px`)
          object[`@media (max-width: ${value})`] = {
            "grid-template-columns": columns[key],
          }
        }
        return object
      }, {})),
    ...(gap && { gap }),
    ...(breakpoint && {
      [`@media (max-width: ${breakpoint})`]: {
        "grid-template-columns": "1fr",
      },
    }),
  }

  const styles = css`
    .grid {
      ${css.create(styleObject).toString()}
    }
  `

  return [
    Div({ className: [styles.grid, className], style }, children),
    styles.css,
  ]
}

module.exports = component(Grid)
