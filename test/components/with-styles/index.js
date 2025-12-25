const { Html, Head, Body, Div, component, css } = require("../../..")

const styles = css`
  .container { color: red; }
`

const MyComponent = component(
  ({ text }) => {
    return Html([
      Head([]),
      Body([
        Div({ class: styles.container }, text)
      ])
    ])
  },
  { styles }
)

module.exports = MyComponent
