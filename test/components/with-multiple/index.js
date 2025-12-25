const { Html, Head, Body, Div, component, css, js } = require("../../..")

const style1 = css`.a { color: red; }`
const style2 = css`.b { color: blue; }`
const script1 = js`console.log('one');`
const script2 = js`console.log('two');`

const MyComponent = component(
  ({ text }) => {
    return Html([
      Head([]),
      Body([
        Div({}, text)
      ])
    ])
  },
  { styles: [style1, style2], scripts: [script1, script2] }
)

module.exports = MyComponent
