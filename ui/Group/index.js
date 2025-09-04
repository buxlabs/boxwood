const { css, component, Div } = require("../..")

function Group({ gap }, children) {
  const styles = css`
    .group {
      display: flex;
    }
  `

  return [Div({ className: styles.group }, children), styles.css]
}

module.exports = component(Group)
