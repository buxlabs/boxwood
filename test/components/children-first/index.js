const { Div, component } = require("../../..")

const MyComponent = component(
  (options, children) => {
    return Div({}, children)
  }
)

module.exports = MyComponent
