const { component, div } = require("../../..")

module.exports = component(() => {
  return [
    div({ style: "color:red" }, "foo"),
    div({ style: { color: "blue" } }, "bar"),
    div({ style: { color: "blue", background: "red" } }, "baz"),
  ]
})
