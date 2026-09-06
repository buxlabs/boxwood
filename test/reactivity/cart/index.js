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
    return Header({ class: styles.cart }, [
      Span({ class: styles.count }, "0"),
      Span(" items, "),
      Span({ class: styles.total }, "$0.00"),
      Button({ type: "button", class: styles.clear }, "Clear"),
    ])
  },
  {
    styles,
    scripts: [
      js`
        document.querySelectorAll('.${styles.cart}').forEach(function (cart) {
          // The bundle may run again on a document it has already wired up -
          // a soft navigation, a swapped in fragment, an accidental second
          // include. Listeners must not stack.
          if (cart.dataset.ready) return
          cart.dataset.ready = 'true'

          const count = cart.querySelector('.${styles.count}')
          const total = cart.querySelector('.${styles.total}')
          const clear = cart.querySelector('.${styles.clear}')

          let items = 0
          let amount = 0

          function render() {
            count.textContent = String(items)
            total.textContent = '$' + amount.toFixed(2)
          }

          document.addEventListener('cart:add', function (event) {
            items += 1
            amount += event.detail.price
            render()
          })

          clear.addEventListener('click', function () {
            items = 0
            amount = 0
            render()
            document.dispatchEvent(new CustomEvent('cart:cleared'))
          })
        })
      `,
    ],
  }
)

const Product = component(
  ({ id, name, price }) => {
    return Div({ class: styles.product, "data-id": id }, [
      Span(name),
      Span(`$${price.toFixed(2)}`),
      Button({ type: "button", "data-price": String(price) }, "Add"),
      Span({ class: styles.added }),
    ])
  },
  {
    styles,
    scripts: [
      js`
        document.querySelectorAll('.${styles.product}').forEach(function (product) {
          // The bundle may run again on a document it has already wired up -
          // a soft navigation, a swapped in fragment, an accidental second
          // include. Listeners must not stack.
          if (product.dataset.ready) return
          product.dataset.ready = 'true'

          const button = product.querySelector('button')
          const added = product.querySelector('.${styles.added}')

          let times = 0

          function render() {
            added.textContent = times === 0 ? '' : 'added ' + times + 'x'
          }

          button.addEventListener('click', function () {
            times += 1
            render()
            document.dispatchEvent(
              new CustomEvent('cart:add', {
                detail: {
                  id: product.getAttribute('data-id'),
                  price: Number(button.getAttribute('data-price')),
                },
              })
            )
          })

          document.addEventListener('cart:cleared', function () {
            times = 0
            render()
          })
        })
      `,
    ],
  }
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
