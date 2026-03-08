const {
  Ul,
  Li,
  A,
  Div,
  Span,
  P,
  Strong,
  Em,
  Section,
  Article,
  H1,
  H2,
} = require("../../..")

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

    // === Variadic Tests ===

    // Basic: multiple string children
    Div("First", "Second", "Third"),

    // Multiple element children
    Div(Span("First"), Span("Second"), Span("Third")),

    // Variadic with attributes
    Div({ className: "container" }, P("One"), P("Two"), P("Three")),

    // Mixed: strings and elements
    P("Text ", Strong("bold"), " more text ", Em("italic")),

    // Deeply nested with variadic
    Section(
      H1("Title"),
      P("Paragraph one"),
      P("Paragraph two"),
      Div(Span("nested"), Span("content")),
    ),

    // Variadic with numbers
    Div(1, 2, 3, 4, 5),

    // Variadic with mixed types
    Div("text", 42, Span("element"), "more text"),

    // Attributes with single child (ensure we didn't break this)
    Div({ id: "single" }, "Single child"),

    // Attributes with number child
    Div({ id: "number" }, 123),

    // Complex nesting with variadic
    Article(
      { className: "post" },
      H2("Article Title"),
      P("First paragraph"),
      P("Second paragraph"),
      Div(Strong("Important: "), Span("Some content"), Em(" with emphasis")),
    ),

    // Many children (stress test)
    Ul(
      Li("Item 1"),
      Li("Item 2"),
      Li("Item 3"),
      Li("Item 4"),
      Li("Item 5"),
      Li("Item 6"),
      Li("Item 7"),
      Li("Item 8"),
    ),

    // Attributes with many children
    Div(
      { className: "grid" },
      Div("Cell 1"),
      Div("Cell 2"),
      Div("Cell 3"),
      Div("Cell 4"),
    ),
  ]
}
