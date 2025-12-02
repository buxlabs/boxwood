const { component, Div } = require("../../..")

module.exports = component(() => {
  return [
    Div({ style: "color:red" }, "foo"),
    Div({ style: { color: "blue" } }, "bar"),
    Div({ style: { color: "blue", background: "red" } }, "baz"),
    Div({ style: { margin: 0 } }, "qux"),
    Div({ style: { margin: { left: "10px" } } }, "quux"),
    Div({ style: { padding: { left: "20px" } } }, "quuux"),
  ]
})
