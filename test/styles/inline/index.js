const { component, Div } = require("../../..")

module.exports = component(() => {
  return [
    Div({ style: "color:red" }, "foo"),
    Div({ style: { color: "blue" } }, "bar"),
    Div({ style: { color: "blue", background: "red" } }, "baz"),
  ]
})
