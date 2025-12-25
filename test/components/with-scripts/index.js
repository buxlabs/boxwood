const { Html, Head, Body, Div, component, js } = require("../../..")

const script = js`
  console.log('test');
`

const MyComponent = component(
  ({ text }) => {
    return Html([
      Head([]),
      Body([
        Div({}, text)
      ])
    ])
  },
  { scripts: script }
)

module.exports = MyComponent
