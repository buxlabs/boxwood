const { join } = require("path")
const {
  component,
  css,
  js,
  Body,
  Button,
  Div,
  H1,
  Head,
  Header,
  Html,
  Span,
  Title,
} = require("../../..")

const styles = css.load(__dirname)

/*
 * Two components that never mention each other and still have to agree. The
 * badge owns the totals, every product owns its own tally, and the only thing
 * between them is an event on the document - in both directions, because
 * clearing the cart has to reach back into each product.
 *
 * A reactive layer would replace this with a store. The point of the fixture
 * is what the store has to be equivalent to.
 */
const Badge = component(
  () => {
    return Header({ class: styles.cart, "data-cart": "" }, [
      Span({ class: styles.count, "data-count": "" }, "0"),
      Span(" items, "),
      Span({ class: styles.total, "data-total": "" }, "$0.00"),
      Button(
        { type: "button", class: styles.clear, "data-clear": "" },
        "Clear",
      ),
    ])
  },
  {
    styles,
    scripts: [js.load(join(__dirname, "badge.js"))],
  },
)

const Product = component(
  ({ id, name, price }) => {
    return Div({ class: styles.product, "data-product": "", "data-id": id }, [
      Span(name),
      Span(`$${price.toFixed(2)}`),
      Button(
        { type: "button", "data-add": "", "data-price": String(price) },
        "Add",
      ),
      Span({ class: styles.added, "data-added": "" }),
    ])
  },
  {
    styles,
    scripts: [js.load(join(__dirname, "product.js"))],
  },
)

module.exports = component(({ products }) => {
  return Html([
    Head([Title("Cart")]),
    Body([
      Badge(),
      H1("Products"),
      ...products.map((product) => Product(product)),
    ]),
  ])
})
