const { css, component, Div } = require("../..")

const styles = css`
  .container {
    box-sizing: border-box;
    margin-left: auto;
    margin-right: auto;
    max-width: 1168px;
    padding-left: 16px;
    padding-right: 16px;
    width: 100%;
  }

  @media (max-width: 1199px) {
    .container {
      max-width: 100%;
    }
  }
`

function Container({ className, style, children }) {
  return Div({ className: [styles.container, className], style }, children)
}

module.exports = component(Container)
