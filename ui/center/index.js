const { css, component, Div } = require("../..")

function Center({ className, style, height, width } = {}, children) {
  const styleObject = {
    display: "flex",
    "justify-content": "center",
    "align-items": "center",
    "flex-direction": "column",
    width: width || "100%",
    height: height || "100dvh",
  }

  const styles = css`
    .center {
      ${css.create(styleObject).toString()}
    }
  `

  return [
    Div({ className: [className, styles.center], style }, children),
    styles.css,
  ]
}

module.exports = component(Center)
