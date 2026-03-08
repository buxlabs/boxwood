const { Ul, Li, A, Div, Span } = require("../../..")

module.exports = () => {
  return [
    // This should work: nested elements without arrays
    Ul(Li(A("Hello"))),
    // This should also work: with arrays
    Ul([Li([A("World")])]),
    // This should work: multiple nested children
    Ul(Li(A({ href: "#" }, "Link"))),
    // Edge case: deeply nested elements
    Div(Div(Div(Span("Deep")))),
    // Edge case: element with name attribute should not be confused with element object
    Div({ name: "myDiv", id: "test" }, "Content"),
  ]
}
