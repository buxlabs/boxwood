const { Div } = require("../../..")

module.exports = () => {
  return Div([
    { foo: "bar" }, // plain object without name property - should render as empty string
    "text"
  ])
}
