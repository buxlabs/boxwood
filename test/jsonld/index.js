const { component, Html, Head, Body, Title, Div, Script } = require("../..")

// A component that renders structured data - used multiple times on a page
const Product = component(({ name }) =>
  Div([
    name,
    Script(
      { type: "application/ld+json" },
      JSON.stringify({ "@context": "https://schema.org", "@type": "Product", name }),
    ),
  ]),
)

module.exports = () => {
  return Html([
    Head([Title("Shop")]),
    Body([
      Product({ name: "Widget" }),
      Product({ name: "Widget" }),
      Product({ name: "Gadget" }),
    ]),
  ])
}
