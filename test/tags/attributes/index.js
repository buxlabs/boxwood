const { Div } = require("../../..")

module.exports = () => {
  return [
    // Test null/undefined attributes
    Div(null, "No attrs"),
    Div(undefined, "No attrs 2"),
    // Test style with invalid key
    Div(
      { style: { "invalid-key!": "value", color: "red" } },
      "Invalid style key",
    ),
    // Test namespaced attributes with colons
    Div({ "xml:lang": "en", "data-test": "value" }, "Namespaced attributes"),
    Div({ "xmlns:xlink": "http://www.w3.org/1999/xlink" }, "XML namespace"),
    Div({ "xlink:href": "#icon" }, "XLink attribute"),
    // Test that invalid characters are still filtered
    Div(
      { "invalid@attr": "value", "valid-attr": "ok", "invalid!key": "no" },
      "Invalid chars filtered",
    ),
  ]
}
