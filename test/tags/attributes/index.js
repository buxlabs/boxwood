const { Div } = require("../../..")

module.exports = () => {
  return [
    // Test null/undefined attributes
    Div(null, "No attrs"),
    Div(undefined, "No attrs 2"),
    // Test style with invalid key
    Div({ style: { 'invalid-key!': 'value', color: 'red' } }, "Invalid style key"),
  ]
}
