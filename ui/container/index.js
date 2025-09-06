const { css, component, Div } = require("../..")

function Container(
  { className, style, width = 1200, padding = 16 } = {},
  children
) {
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

    @media (max-width: ${width + padding * 2 - 1}px) {
      .container {
        max-width: 100%;
      }
    }
  `
  return [
    Div({ className: [styles.container, className], style }, children),
    styles.css,
  ]
}

module.exports = component(Container)
