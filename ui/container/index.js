const { css, component, Div } = require("../..")

const normalizeValue = (value) => {
  if (typeof value === "string") {
    if (value.endsWith("px")) {
      return parseInt(value, 10)
    }
    if (value.endsWith("rem")) {
      return parseInt(value, 10) * 16
    }
    throw new Error(
      "Width must be a number or a string ending with 'px' or 'rem'"
    )
  }
  return value
}

function Container(
  { className, style, id, width = 1200, padding = 16 } = {},
  children
) {
  width = normalizeValue(width)
  padding = normalizeValue(padding)
  const styles = css`
    .container {
      box-sizing: border-box;
      margin-left: auto;
      margin-right: auto;
      max-width: ${width}px;
      padding-left: ${padding}px;
      padding-right: ${padding}px;
      width: 100%;
    }

    @media (max-width: ${width - 1}px) {
      .container {
        max-width: 100%;
      }
    }
  `
  return [
    Div({ className: [styles.container, className], id, style }, children),
    styles.css,
  ]
}

module.exports = component(Container)
