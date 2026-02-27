const { Html, Head, Body, Div, component } = require("../../..")

// Simulating a case where styles might not have .css property
const invalidStyles = { container: "some-class" } // Missing .css property

const MyComponent = component(
  ({ text }) => {
    return Html([
      Head([]),
      Body([
        Div({ class: invalidStyles.container }, text)
      ])
    ])
  },
  { styles: invalidStyles }
)

module.exports = MyComponent
